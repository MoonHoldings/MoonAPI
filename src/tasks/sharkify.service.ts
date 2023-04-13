import { Injectable, Logger } from "@nestjs/common"
import { Interval } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { format } from "date-fns"
import { NftList } from "../entities/NftList"
import { Loan } from "./../entities/Loan"
import { OrderBook } from "../entities/OrderBook"
import sharkyClient from "../utils/sharkyClient"
import { In, IsNull, Not, Repository } from "typeorm"
import axios from "axios"
import { AXIOS_CONFIG_HELLO_MOON_KEY, HELLO_MOON_URL, AXIOS_CONFIG_SHYFT_KEY, SHYFT_URL } from "../constants"

@Injectable()
export class SharkifyService {
  private readonly logger = new Logger(SharkifyService.name)

  constructor(
    // @ts-ignore
    @InjectRepository(NftList)
    private readonly nftListRepository: Repository<NftList>,
    // @ts-ignore
    @InjectRepository(OrderBook)
    private readonly orderBookRepository: Repository<OrderBook>,
    // @ts-ignore
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>
  ) {}

  @Interval(60000) // Every 1 min
  async saveLoans() {
    this.logger.debug(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))

    const { program } = sharkyClient
    let newLoans = await sharkyClient.fetchAllLoans({ program })
    let newLoansPubKeys = newLoans.map((loan) => loan.pubKey.toBase58())

    // Delete loans that are not in the new loans
    await this.loanRepository.delete({ pubKey: Not(In(newLoansPubKeys)) })

    // Create new loans that are not yet created, and update existing ones
    const existingLoans = await this.loanRepository.find({ where: { pubKey: In(newLoansPubKeys) } })
    const existingLoansByPubKey = existingLoans.reduce((accumulator: any, loan) => {
      accumulator[loan.pubKey] = loan
      return accumulator
    }, {})

    const existingLoansPubKeys = new Set(existingLoans.map((loan) => loan.pubKey))

    const newlyAddedLoans = []
    const updatedLoanEntities = []

    for (const newLoan of newLoans) {
      if (!existingLoansPubKeys.has(newLoan.pubKey.toBase58())) {
        newlyAddedLoans.push(newLoan)
      } else {
        // If loan exists, check if state changed
        const newLoanPubKey = newLoan.pubKey.toBase58()
        const savedLoan: Loan = existingLoansByPubKey[newLoanPubKey]

        if (savedLoan) {
          if (savedLoan.state !== newLoan.state) {
            savedLoan.lenderWallet = newLoan.data.loanState.offer?.offer.lenderWallet.toBase58()
            savedLoan.offerTime = newLoan.data.loanState.offer?.offer.offerTime?.toNumber()
            savedLoan.nftCollateralMint = newLoan.data.loanState.taken?.taken.nftCollateralMint.toBase58()
            savedLoan.lenderNoteMint = newLoan.data.loanState.taken?.taken.lenderNoteMint.toBase58()
            savedLoan.borrowerNoteMint = newLoan.data.loanState.taken?.taken.borrowerNoteMint.toBase58()
            savedLoan.apy = newLoan.data.loanState.taken?.taken.apy.fixed?.apy
            savedLoan.start = newLoan.data.loanState.taken?.taken.terms.time?.start?.toNumber()
            savedLoan.totalOwedLamports = newLoan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber()
            savedLoan.state = newLoan.state

            updatedLoanEntities.push(savedLoan)
          }
        }
      }
    }

    const newlyAddedLoansOrderBookPubKeys = newlyAddedLoans.map((loan) => loan.data.orderBook.toBase58())
    const uniqueOrderBookPubKeys = newlyAddedLoansOrderBookPubKeys.filter((value, index, self) => {
      return self.indexOf(value) === index
    })

    if (newlyAddedLoans.length > 0) {
      const orderBooks = await this.orderBookRepository.find({ where: { pubKey: In(uniqueOrderBookPubKeys) } })

      const newLoanEntities = newlyAddedLoans.map((loan) => {
        const orderBook = orderBooks.find((orderBook) => loan.data.orderBook.toBase58() === orderBook.pubKey)

        return this.loanRepository.create({
          pubKey: loan.pubKey.toBase58(),
          version: loan.data.version,
          principalLamports: loan.data.principalLamports.toNumber(),
          valueTokenMint: loan.data.valueTokenMint.toBase58(),
          supportsFreezingCollateral: loan.supportsFreezingCollateral,
          isCollateralFrozen: loan.isCollateralFrozen,
          isHistorical: loan.isHistorical,
          isForeclosable: loan.isForeclosable("mainnet"),
          state: loan.state,
          duration: loan.data.loanState?.offer?.offer.termsSpec.time?.duration?.toNumber() || loan.data.loanState.taken?.taken.terms.time?.duration?.toNumber(),
          lenderWallet: loan.data.loanState.offer?.offer.lenderWallet.toBase58(),
          offerTime: loan.data.loanState.offer?.offer.offerTime?.toNumber(),
          nftCollateralMint: loan.data.loanState.taken?.taken.nftCollateralMint.toBase58(),
          lenderNoteMint: loan.data.loanState.taken?.taken.lenderNoteMint.toBase58(),
          borrowerNoteMint: loan.data.loanState.taken?.taken.borrowerNoteMint.toBase58(),
          apy: loan.data.loanState.taken?.taken.apy.fixed?.apy,
          start: loan.data.loanState.taken?.taken.terms.time?.start?.toNumber(),
          totalOwedLamports: loan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber(),
          orderBook: orderBook,
        })
      })

      await this.loanRepository.save([...newLoanEntities, ...updatedLoanEntities], { chunk: Math.ceil((newLoanEntities.length + updatedLoanEntities.length) / 10) })
    }

    this.logger.debug(format(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"))
  }

  @Interval(3600000) // Every hour
  async saveOrderBooks() {
    this.logger.debug(format(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"))

    const { program } = sharkyClient

    let newOrderBooks = await sharkyClient.fetchAllOrderBooks({ program })
    let newOrderBooksPubKeys = newOrderBooks.map((orderBook) => orderBook.pubKey.toBase58())

    // Delete order books that are not in the new order books
    await this.orderBookRepository.delete({ pubKey: Not(In(newOrderBooksPubKeys)) })

    // Create new order books that are not yet created
    const existingOrderBooks = await this.orderBookRepository.find({ where: { pubKey: In(newOrderBooksPubKeys) } })
    const existingOrderBooksPubKeys = new Set(existingOrderBooks.map((orderBook) => orderBook.pubKey))

    const newlyAddedOrderBooks = []
    for (const newOrderBook of newOrderBooks) {
      if (!existingOrderBooksPubKeys.has(newOrderBook.pubKey.toBase58())) {
        newlyAddedOrderBooks.push(newOrderBook)
      }
    }

    if (newlyAddedOrderBooks.length > 0) {
      const orderBookEntities = await Promise.all(
        newlyAddedOrderBooks.map(async (orderBook) => {
          const nftList = await this.nftListRepository.findOne({ where: { pubKey: orderBook.orderBookType.nftList?.listAccount.toBase58() } })

          return this.orderBookRepository.create({
            pubKey: orderBook.pubKey.toBase58(),
            version: orderBook.version,
            apy: orderBook.apy.fixed?.apy,
            listAccount: orderBook.orderBookType.nftList?.listAccount.toBase58(),
            duration: orderBook.loanTerms.fixed?.terms.time?.duration.toNumber(),
            feePermillicentage: orderBook.feePermillicentage,
            feeAuthority: orderBook.feeAuthority.toBase58(),
            nftList: nftList || undefined,
          })
        })
      )

      await this.orderBookRepository.save(orderBookEntities)
    }

    this.logger.debug(format(new Date(), "'saveOrderBooks end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveOrderBooks end:' MMMM d, yyyy hh:mma"))
  }

  @Interval(3600000) // Every hour
  async saveNftList() {
    this.logger.debug(format(new Date(), "'saveNftList start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftList start:' MMMM d, yyyy hh:mma"))

    try {
      const { program } = sharkyClient

      // const currentNftList = await this.nftListRepository.find()
      let newNftLists = await sharkyClient.fetchAllNftLists({ program })
      let newNftListPubKeys = newNftLists.map((nftList) => nftList.pubKey.toBase58())

      // Delete nft list that are not in the new nft list
      await this.nftListRepository.delete({ pubKey: Not(In(newNftListPubKeys)) })

      // Create new order books that are not yet created
      const existingNftList = await this.nftListRepository.find({ where: { pubKey: In(newNftListPubKeys) } })
      const existingNftListPubKeys = new Set(existingNftList.map((nftList) => nftList.pubKey))

      const newlyAddedNftLists = []

      for (const newNftList of newNftLists) {
        if (!existingNftListPubKeys.has(newNftList.pubKey.toBase58())) {
          newlyAddedNftLists.push(newNftList)
        }
      }

      if (newlyAddedNftLists.length > 0) {
        const nftListEntities = newlyAddedNftLists.map((nftList) => {
          return this.nftListRepository.create({
            collectionName: nftList.collectionName,
            pubKey: nftList.pubKey.toBase58(),
            version: nftList.version,
            nftMint: nftList.mints[nftList.mints.length - 1].toBase58(),
          })
        })

        await this.nftListRepository.save(nftListEntities)
      }
    } catch (e) {
      console.log("ERROR", e)
    }

    this.logger.debug(format(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"))
  }

  @Interval(3600000) // Every hour
  async saveNftListImages() {
    this.logger.debug(format(new Date(), "'saveNftListImages start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftListImages start:' MMMM d, yyyy hh:mma"))

    try {
      const nftLists = await this.nftListRepository.find({ where: { collectionImage: IsNull() } })

      const imagePromises = nftLists.map(async (nftList) => {
        // Fetch collection image via nftMint
        const { data: mintInfo } = await axios.post(
          `${HELLO_MOON_URL}/nft/mint_information`,
          {
            nftMint: nftList?.nftMint,
          },
          AXIOS_CONFIG_HELLO_MOON_KEY
        )

        const nftMint = mintInfo?.data[0]?.nftCollectionMint

        if (nftMint) {
          const { data: metadata } = await axios.get(`${SHYFT_URL}/nft/read?network=mainnet-beta&token_address=${nftMint}`, AXIOS_CONFIG_SHYFT_KEY)
          nftList.collectionImage = metadata?.result?.cached_image_uri ?? metadata?.result?.image_uri
        }

        return Promise.resolve()
      })

      await Promise.allSettled(imagePromises)
      await this.nftListRepository.save(nftLists)
    } catch (e) {
      console.log("ERROR", e)
    }

    this.logger.debug(format(new Date(), "'saveNftListImages end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftListImages end:' MMMM d, yyyy hh:mma"))
  }

  @Interval(300000) // Every 5 mins
  async saveNftListFloorPrices() {
    this.logger.debug(format(new Date(), "'saveNftListPrices start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftListPrices start:' MMMM d, yyyy hh:mma"))

    const fetchHelloMoonCollectionIds = async (addresses: any[], paginationToken?: string) => {
      const { data: collectionIdResponse } = await axios.post(
        `${HELLO_MOON_URL}/nft/collection/mints`,
        {
          nftMint: addresses,
          paginationToken,
        },
        AXIOS_CONFIG_HELLO_MOON_KEY
      )

      return collectionIdResponse
    }

    const fetchFloorPrice = async (id: any) => {
      const res = await axios.post(
        `${HELLO_MOON_URL}/nft/collection/floorprice`,
        {
          helloMoonCollectionId: id,
        },
        AXIOS_CONFIG_HELLO_MOON_KEY
      )

      return res?.data?.data?.length ? res?.data?.data[0] : undefined
    }

    try {
      const nftLists = await this.nftListRepository.find()
      const nftMintToListMap: Record<string, NftList> = nftLists.reduce((map: Record<string, NftList>, nftList) => {
        map[nftList.nftMint] = nftList
        return map
      }, {})

      const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(nftLists.map((nftList) => nftList.nftMint))
      let allIds = [...collectionIds]
      let currentPaginationToken = paginationToken

      while (currentPaginationToken) {
        const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(
          nftLists.map((nftList) => nftList.nftMint),
          currentPaginationToken
        )

        currentPaginationToken = paginationToken
        allIds = [...allIds, ...collectionIds]
      }

      const collectionIdToNftListMap: Record<string, NftList> = {}

      allIds?.forEach((data: any) => {
        collectionIdToNftListMap[data.helloMoonCollectionId] = nftMintToListMap[data.nftMint]
      })

      console.log("collectionIds", allIds.length)

      const promises = allIds.map(async (id: any) => {
        const { floorPriceLamports, helloMoonCollectionId } = (await fetchFloorPrice(id.helloMoonCollectionId)) ?? {}
        return { floorPriceLamports, helloMoonCollectionId }
      })

      const floorPrices = await Promise.all(promises)

      console.log("floorPrices", floorPrices.length)

      const nftListsToSave: NftList[] = []

      for (const { floorPriceLamports, helloMoonCollectionId } of floorPrices) {
        if (floorPriceLamports && helloMoonCollectionId) {
          const nftList = collectionIdToNftListMap[helloMoonCollectionId]

          nftList.floorPrice = floorPriceLamports
          nftListsToSave.push(nftList)
        }
      }

      await this.nftListRepository.save(nftListsToSave)
    } catch (e) {
      console.log("ERROR", e)
    }

    this.logger.debug(format(new Date(), "'saveNftListPrices end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftListPrices end:' MMMM d, yyyy hh:mma"))
  }
}

import { Injectable, Logger } from "@nestjs/common"
import { Interval } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { format } from "date-fns"
import { NftList } from "../entities/NftList"
import { Loan } from "./../entities/Loan"
import { OrderBook } from "../entities/OrderBook"
import sharkyClient from "../utils/sharkyClient"
import { Repository } from "typeorm"

@Injectable()
export class SharkifyService {
  private readonly logger = new Logger(SharkifyService.name)

  constructor(
    @InjectRepository(NftList)
    private readonly nftListRepository: Repository<NftList>,
    @InjectRepository(OrderBook)
    private readonly orderBookRepository: Repository<OrderBook>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>
  ) {}

  @Interval(300000) // Every 5 mins
  async saveLoans() {
    this.logger.debug(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))

    const { program } = sharkyClient

    await this.loanRepository.query("ALTER SEQUENCE loan_id_seq RESTART WITH 1")
    await this.loanRepository.delete({})

    let newLoans = await sharkyClient.fetchAllLoans({ program })

    if (newLoans.length > 0) {
      const queriedOrderBooks: [OrderBook] = [] as any

      let loanEntities = await Promise.all(
        newLoans.map(async (loan) => {
          let orderBook: OrderBook | null | undefined = queriedOrderBooks.find((orderBook) => orderBook.pubKey === loan.data.orderBook.toBase58())

          if (!orderBook) {
            orderBook = await this.orderBookRepository.findOne({ where: { pubKey: loan.data.orderBook.toBase58() } })

            if (orderBook) {
              queriedOrderBooks.push(orderBook)
            }
          }

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
            orderBook: orderBook || undefined,
          })
        })
      )

      await this.loanRepository.save(loanEntities, { chunk: 50 })
    }

    this.logger.debug(format(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveLoans end:' MMMM d, yyyy hh:mma"))
  }

  @Interval(3600000) // Every hour
  async saveOrderBooks() {
    this.logger.debug(format(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveOrderBooks start:' MMMM d, yyyy hh:mma"))

    const { program } = sharkyClient

    const currentOrderBooks = await this.orderBookRepository.find()
    let newOrderBooks = await sharkyClient.fetchAllOrderBooks({ program })

    if (currentOrderBooks.length > 0) {
      newOrderBooks = newOrderBooks.filter((orderBook) => currentOrderBooks.find((n) => n.pubKey === orderBook.pubKey.toBase58()) === undefined)
    }

    if (newOrderBooks.length > 0) {
      const orderBookEntities = await Promise.all(
        newOrderBooks.map(async (orderBook) => {
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

      const currentNftList = await this.nftListRepository.find()
      let newNftList = await sharkyClient.fetchAllNftLists({ program })

      if (currentNftList.length > 0) {
        newNftList = newNftList.filter((nftList) => currentNftList.find((n) => n.pubKey === nftList.pubKey.toBase58()) === undefined)
      }

      if (newNftList.length > 0) {
        const collectionEntities = newNftList.map((collection) => {
          return this.nftListRepository.create({
            collectionName: collection.collectionName,
            pubKey: collection.pubKey.toBase58(),
            version: collection.version,
            nftMint: collection.mints[collection.mints.length - 1].toBase58(),
          })
        })

        await this.nftListRepository.save(collectionEntities)
      }
    } catch (e) {
      console.log("ERROR", e)
    }

    this.logger.debug(format(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveNftList end:' MMMM d, yyyy hh:mma"))
  }
}

import { Injectable, Logger } from "@nestjs/common"
import { Interval } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { format } from "date-fns"
import { NftList } from "../entities/NftList"
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
    private readonly orderBookRepository: Repository<OrderBook>
  ) {}

  @Interval(3600000)
  saveLoans() {
    this.logger.debug(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))
    console.log(format(new Date(), "'saveLoans start:' MMMM d, yyyy hh:mma"))

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
            version: orderBook.version.toString(),
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
            version: collection.version.toString(),
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

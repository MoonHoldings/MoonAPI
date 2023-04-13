import { GetOrderBooksArgs, OrderBookSortType, PaginatedOrderBookResponse, SortOrder } from "../types"
import { OrderBook } from "../entities"
import { Service } from "typedi"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

@Service()
export class OrderBookService {
  async getOrderBookById(id: number): Promise<OrderBook> {
    return await OrderBook.findOneOrFail({
      where: { id },
      relations: {
        nftList: true,
        loans: true,
      },
    })
  }

  async getOrderBooks(args: GetOrderBooksArgs): Promise<PaginatedOrderBookResponse> {
    let query = OrderBook.createQueryBuilder("orderBook")
      .select("orderBook.id", "id")
      .addSelect("nftList.collectionName", "collectionName")
      .addSelect("nftList.collectionImage", "collectionImage")
      .addSelect("orderBook.apy", "apy")
      .addSelect("orderBook.duration", "duration")
      .addSelect("COALESCE(SUM(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", "totalpool")
      .addSelect("COALESCE(MAX(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", "bestOffer")
      .innerJoin("orderBook.nftList", "nftList")
      .leftJoin("orderBook.loans", "loan")

    if (args?.filter?.search) {
      query.where("nftList.collectionName ILIKE :name", { name: `%${args.filter.search}%` })
    }

    const count = await query.getCount()

    if (args?.pagination?.offset) {
      query.offset(args.pagination.offset)
    }

    if (args?.pagination?.limit) {
      query.limit(args.pagination.limit)
    }

    query.groupBy("orderBook.id, nftList.collectionName, nftList.collectionImage")

    switch (args?.sort?.type) {
      case OrderBookSortType.Apy:
        query.orderBy("apy", args?.sort?.order ?? SortOrder.Desc)
        break
      case OrderBookSortType.Collection:
        query.orderBy("collectionName", args?.sort?.order ?? SortOrder.Desc)
        break
      case OrderBookSortType.Duration:
        query.orderBy("duration", args?.sort?.order ?? SortOrder.Desc)
        break
      case OrderBookSortType.TotalPool:
        query.orderBy("totalpool", args?.sort?.order ?? SortOrder.Desc)
        break
      case OrderBookSortType.BestOffer:
        query.orderBy("bestOffer", args?.sort?.order ?? SortOrder.Desc)
        break
      default:
        query.orderBy("totalpool", args?.sort?.order ?? SortOrder.Desc)
        break
    }

    const rawData = await query.getRawMany()

    const orderBooks = rawData.map((orderBook) => ({
      id: orderBook.id,
      apy: orderBook.apy,
      duration: orderBook.duration,
      collectionName: orderBook.collectionName,
      collectionImage: orderBook.collectionImage,
      totalPool: parseFloat(orderBook.totalpool) / LAMPORTS_PER_SOL,
      bestOffer: parseFloat(orderBook.bestOffer) / LAMPORTS_PER_SOL,
    }))

    return {
      count,
      data: orderBooks,
    }
  }
}

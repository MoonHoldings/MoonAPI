import { GetOrderBooksArgs, OrderBookPaginatedResponse, OrderBookSortType, SortOrder } from "../types"
import { OrderBook } from "../entities"
import { Service } from "typedi"
import { ILike } from "typeorm"

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

  async getOrderBooks(args: GetOrderBooksArgs): Promise<OrderBookPaginatedResponse> {
    const where: any = {}
    let order: any = {}

    if (args.filter?.search) {
      where["nftList"] = { collectionName: ILike(`%${args.filter?.search}%`) }
    }

    switch (args.sort?.type) {
      case OrderBookSortType.Apy:
        order = { apy: args.sort.order }
        break
      case OrderBookSortType.Collection:
        order = { nftList: { collectionName: SortOrder.Asc } }
        break
      case OrderBookSortType.Duration:
        order = { duration: args.sort.order }
        break
      case OrderBookSortType.TotalPool:
        break
      case OrderBookSortType.BestOffer:
        break
      default:
        order = { nftList: { collectionName: SortOrder.Asc } }
        break
    }

    const data = await OrderBook.find({
      order,
      skip: args.pagination?.offset,
      take: args.pagination?.limit,
      where,
      relations: { nftList: true, loans: true },
    })

    return {
      count: await OrderBook.count({ where }),
      data,
    }
  }
}

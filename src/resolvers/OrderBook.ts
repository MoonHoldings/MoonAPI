import { OrderBookService } from "../services"
import { OrderBook } from "../entities"
import { Resolver, Query, Arg } from "type-graphql"
import Container from "typedi"
import { PaginatedOrderBookResponse, GetOrderBooksArgs } from "../types"

@Resolver()
export class OrderBookResolver {
  private orderBookService = Container.get(OrderBookService)

  @Query(() => OrderBook)
  async getOrderBook(@Arg("id", () => Number) id: number): Promise<OrderBook> {
    return await this.orderBookService.getOrderBookById(id)
  }

  @Query(() => PaginatedOrderBookResponse)
  async getOrderBooks(@Arg("args", { nullable: true }) args: GetOrderBooksArgs): Promise<PaginatedOrderBookResponse> {
    return await this.orderBookService.getOrderBooks(args)
  }
}

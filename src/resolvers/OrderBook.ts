import { OrderBook } from "../entities/OrderBook"
import { Resolver, Query, Arg } from "type-graphql"

@Resolver()
export class OrderBookResolver {
  @Query(() => [OrderBook])
  async getOrderBook(@Arg("id", () => Number) id: number): Promise<OrderBook> {
    return await OrderBook.findOneOrFail({
      where: { id },
    })
  }
}

import * as orderBookService from '../services/OrderBook'
import { OrderBook } from '../entities'
import { Resolver, Query, Arg, Authorized } from 'type-graphql'
import { PaginatedOrderBookResponse, GetOrderBooksArgs, UserRole } from '../types'

@Resolver()
export class OrderBookResolver {
  @Authorized(UserRole.Superuser)
  @Query(() => OrderBook)
  async getOrderBook(@Arg('id', () => Number) id: number): Promise<OrderBook> {
    return await orderBookService.getOrderBookById(id)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => PaginatedOrderBookResponse)
  async getOrderBooks(@Arg('args', { nullable: true }) args: GetOrderBooksArgs): Promise<PaginatedOrderBookResponse> {
    return await orderBookService.getOrderBooks(args)
  }
}

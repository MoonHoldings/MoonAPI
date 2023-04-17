import * as orderBookService from '../services/OrderBook'
import { OrderBook } from '../entities'
import { Resolver, Query, Arg } from 'type-graphql'
import { PaginatedOrderBookResponse, GetOrderBooksArgs } from '../types'

@Resolver()
export class OrderBookResolver {


  @Query(() => OrderBook)
  async getOrderBook(@Arg('id', () => Number) id: number): Promise<OrderBook> {
    return await orderBookService.getOrderBookById(id)
  }

  @Query(() => PaginatedOrderBookResponse)
  async getOrderBooks(@Arg('args', { nullable: true }) args: GetOrderBooksArgs): Promise<PaginatedOrderBookResponse> {
    return await orderBookService.getOrderBooks(args)
  }
}

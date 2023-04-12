import { Loan, OrderBook } from "../entities"
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
export class LoansPaginatedResponse {
  @Field(() => Int)
  count: number
  @Field(() => [Loan])
  data: Loan[]
}

@ObjectType()
export class OrderBookPaginatedResponse {
  @Field(() => Int)
  count: number
  @Field(() => [OrderBook])
  data: OrderBook[]
}

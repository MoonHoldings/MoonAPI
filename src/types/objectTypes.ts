import { Loan } from "../entities"
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
export class PaginatedLoanResponse {
  @Field(() => Int)
  count: number
  @Field(() => [Loan])
  data: Loan[]
}

@ObjectType()
export class OrderBookList {
  @Field(() => Int)
  id: number
  @Field(() => Number)
  apy: number
  @Field(() => Number)
  duration: number
  @Field(() => String)
  collectionName: string
  @Field(() => String, { nullable: true })
  collectionImage?: string
  @Field(() => Number, { nullable: true })
  totalPool?: number
  @Field(() => Number, { nullable: true })
  bestOffer?: number
}

@ObjectType()
export class PaginatedOrderBookResponse {
  @Field(() => Int)
  count: number
  @Field(() => [OrderBookList])
  data: OrderBookList[]
}

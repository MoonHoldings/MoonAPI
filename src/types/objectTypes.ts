import { Loan } from "../entities"
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
export class PaginatedLoanResponse {
  @Field(() => Int)
  count: number
  @Field(() => [Loan])
  data: Loan[]
  @Field(() => Number, { nullable: true })
  totalOffers?: number
  @Field(() => Number, { nullable: true })
  totalActive?: number
  @Field(() => Number, { nullable: true })
  offerCount?: number
  @Field(() => Number, { nullable: true })
  activeCount?: number
}

@ObjectType()
export class OrderBookList {
  @Field(() => Int)
  id: number
  @Field(() => String)
  pubKey: string
  @Field(() => Number)
  apy: number
  @Field(() => Number, { nullable: true })
  apyAfterFee?: number
  @Field(() => Number)
  duration: number
  @Field(() => Number)
  feePermillicentage: number
  @Field(() => String, { nullable: true })
  collectionName: string
  @Field(() => String, { nullable: true })
  collectionImage?: string
  @Field(() => Number, { nullable: true })
  floorPrice?: number
  @Field(() => Number, { nullable: true })
  floorPriceSol?: number
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

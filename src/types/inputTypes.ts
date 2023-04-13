import { InputType, Field } from "type-graphql"
import { LoanType, OrderBookSortType, SortOrder } from "./enums"

@InputType()
export class LimitOffset {
  @Field({ nullable: true })
  limit?: number
  @Field({ nullable: true })
  offset?: number
}

@InputType()
export class GetLoansFilter {
  @Field({ nullable: true })
  type?: LoanType
  @Field({ nullable: true })
  lenderWallet?: string
  @Field({ nullable: true })
  borrowerWallet?: string
}

@InputType()
export class LoanSort {
  @Field({ nullable: true })
  type?: OrderBookSortType
  @Field({ nullable: true })
  order?: SortOrder
}

@InputType()
export class GetLoansArgs {
  @Field({ nullable: true })
  filter?: GetLoansFilter
  @Field({ nullable: true })
  pagination?: LimitOffset
}

@InputType()
export class GetOrderBooksFilter {
  @Field({ nullable: true })
  search?: string
}

@InputType()
export class OrderBookSort {
  @Field({ nullable: true })
  type?: OrderBookSortType
  @Field({ nullable: true })
  order?: SortOrder
}

@InputType()
export class GetOrderBooksArgs {
  @Field({ nullable: true })
  filter?: GetOrderBooksFilter
  @Field({ nullable: true })
  pagination?: LimitOffset
  @Field({ nullable: true })
  sort?: OrderBookSort
}

import { InputType, Field } from "type-graphql"
import { LoanType } from "./enums"

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
export class GetLoansArgs {
  @Field({ nullable: true })
  filter?: GetLoansFilter
  @Field({ nullable: true })
  pagination?: LimitOffset
}

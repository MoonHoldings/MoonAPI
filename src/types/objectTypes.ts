import { Loan } from "./../entities/Loan"
import { ObjectType, Field, Int } from "type-graphql"

@ObjectType()
export class LoansPaginatedResponse {
  @Field(() => Int)
  count: number
  @Field(() => [Loan])
  data: Loan[]
}

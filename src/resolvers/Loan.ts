import { Loan } from "../entities/Loan"
import { Resolver, Query, Arg } from "type-graphql"

@Resolver()
export class LoanResolver {
  @Query(() => [Loan])
  async getLoan(@Arg("id", () => [Number]) id: number): Promise<Loan> {
    return await Loan.findOneOrFail({
      where: { id },
    })
  }
}

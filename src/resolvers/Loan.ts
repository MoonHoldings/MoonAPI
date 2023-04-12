import { LoanService } from "../services";
import { Loan } from "../entities"
import { Resolver, Query, Arg } from "type-graphql"
import Container from 'typedi';

@Resolver()
export class LoanResolver {

  private loanService = Container.get(LoanService);

  @Query(() => Loan)
  async getLoan(@Arg("id", () => Number) id: number): Promise<Loan> {
    return await this.loanService.getLoanById(id);
  }
}

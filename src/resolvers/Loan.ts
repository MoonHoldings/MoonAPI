import { Resolver, Query, Arg } from 'type-graphql'
import Container from 'typedi'
import { LoanService } from '../services'
import { Loan } from '../entities'
import { GetLoansArgs, PaginatedLoanResponse } from '../types'

@Resolver()
export class LoanResolver {
  private loanService = Container.get(LoanService)

  @Query(() => Loan)
  async getLoan(@Arg('id', () => Number) id: number): Promise<Loan> {
    return await this.loanService.getLoanById(id)
  }

  @Query(() => PaginatedLoanResponse)
  async getLoans(@Arg('args', { nullable: true }) args: GetLoansArgs): Promise<PaginatedLoanResponse> {
    return await this.loanService.getLoans(args)
  }
}

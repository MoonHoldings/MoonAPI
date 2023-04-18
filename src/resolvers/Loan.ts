import { Resolver, Query, Arg } from 'type-graphql'
import * as loanService from '../services/Loan'
import { Loan } from '../entities'
import { GetLoansArgs, PaginatedLoanResponse } from '../types'

@Resolver()
export class LoanResolver {
  @Query(() => Loan)
  async getLoan(@Arg('id', () => Number) id: number): Promise<Loan> {
    return await loanService.getLoanById(id)
  }

  @Query(() => PaginatedLoanResponse)
  async getLoans(@Arg('args', { nullable: true }) args: GetLoansArgs): Promise<PaginatedLoanResponse> {
    return await loanService.getLoans(args)
  }
}

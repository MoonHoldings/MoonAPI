import { Resolver, Query, Arg, Authorized } from 'type-graphql'
import * as loanService from '../services/Loan'
import { Loan } from '../entities'
import { GetLoansArgs, HistoricalLoanResponse, PaginatedLoanResponse, UserRole } from '../types'

@Resolver()
export class LoanResolver {
  @Authorized(UserRole.Superuser)
  @Query(() => Loan)
  async getLoan(@Arg('id', () => Number) id: number): Promise<Loan> {
    return await loanService.getLoanById(id)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => PaginatedLoanResponse)
  async getLoans(@Arg('args', { nullable: true }) args: GetLoansArgs): Promise<PaginatedLoanResponse> {
    return await loanService.getLoans(args)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => [HistoricalLoanResponse], { nullable: true })
  async getHistoricalLoansByUser(
    @Arg('borrower', { nullable: true }) borrower: string,
    @Arg('lender', { nullable: true }) lender: string,
    @Arg('offerBlocktime', { nullable: true }) offerBlocktime: number
  ): Promise<HistoricalLoanResponse[] | null> {
    return await loanService.getHistoricalLoansByUser(borrower, lender, offerBlocktime)
  }
}

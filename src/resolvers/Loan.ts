import { Resolver, Query, Arg, Authorized, Mutation } from 'type-graphql'
import * as loanService from '../services/Loan'
import { Loan } from '../entities'
import { BorrowLoan, CreateLoan, GetLoansArgs, HistoricalLoanResponse, LoanCsv, PaginatedHistoricalLoanResponse, PaginatedLoanResponse, TotalLoanResponse, UserRole } from '../types'

@Resolver()
export class LoanResolver {
  @Authorized(UserRole.Superuser)
  @Query(() => Loan)
  async getLoan(@Arg('id', () => Number) id: number): Promise<Loan> {
    return await loanService.getLoanById(id)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => TotalLoanResponse)
  async getTotalLendsByAddress(@Arg('address', () => String) address: string): Promise<TotalLoanResponse> {
    return await loanService.getTotalLendsByAddress(address)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => TotalLoanResponse)
  async getTotalBorrowsByAddress(@Arg('address', () => String) address: string): Promise<TotalLoanResponse> {
    return await loanService.getTotalBorrowsByAddress(address)
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

  @Authorized(UserRole.Superuser)
  @Query(() => PaginatedHistoricalLoanResponse, { nullable: true })
  async getLoanSummary(
    @Arg('borrower', { nullable: true }) borrower: string,
    @Arg('lender', { nullable: true }) lender: string,
    @Arg('paginationToken', { nullable: true }) paginationToken: string
  ): Promise<PaginatedHistoricalLoanResponse> {
    return await loanService.getLoanSummary(borrower, lender, paginationToken)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => [LoanCsv])
  async getLendHistoryCsv(@Arg('address') address: string): Promise<LoanCsv[]> {
    return await loanService.getLendHistoryCsv(address)
  }

  @Authorized(UserRole.Superuser)
  @Query(() => [LoanCsv])
  async getBorrowHistoryCsv(@Arg('address') address: string): Promise<LoanCsv[]> {
    return await loanService.getBorrowHistoryCsv(address)
  }

  @Authorized(UserRole.Superuser)
  @Mutation(() => [Loan])
  async createLoans(@Arg('loans', () => [CreateLoan]) loans: CreateLoan[]): Promise<Loan[]> {
    return await loanService.createLoans(loans)
  }

  @Authorized(UserRole.Superuser)
  @Mutation(() => Loan)
  async borrowLoan(@Arg('borrowedLoan', () => BorrowLoan) borrowedLoan: BorrowLoan): Promise<Loan | null> {
    return await loanService.borrowLoan(borrowedLoan)
  }

  @Authorized(UserRole.Superuser)
  @Mutation(() => String, { nullable: true })
  async deleteLoanByPubKey(@Arg('pubKey', () => String) pubKey: string): Promise<string | null> {
    return await loanService.deleteLoanByPubKey(pubKey)
  }
}

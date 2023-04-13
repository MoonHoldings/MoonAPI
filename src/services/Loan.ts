import { GetLoansArgs, PaginatedLoanResponse } from "../types"
import { Loan } from "../entities"
import { Service } from "typedi"

@Service()
export class LoanService {
  async getLoanById(id: number): Promise<Loan> {
    return await Loan.findOneOrFail({ where: { id } })
  }

  async getLoans(args: GetLoansArgs): Promise<PaginatedLoanResponse> {
    const where = {
      state: args?.filter?.type,
      lenderWallet: args?.filter?.lenderWallet,
      borrowerNoteMint: args?.filter?.borrowerWallet,
    }

    const loans = await Loan.find({
      take: args?.pagination?.limit,
      skip: args?.pagination?.offset,
      where,
      relations: {
        orderBook: {
          nftList: true,
        },
      },
    })

    return {
      count: await Loan.count({ where }),
      data: loans,
    }
  }
}

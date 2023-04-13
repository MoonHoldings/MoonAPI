import { GetLoansArgs, LoanSortType, LoanType, PaginatedLoanResponse, SortOrder } from "../types"
import { Loan } from "../entities"
import { Service } from "typedi"

@Service()
export class LoanService {
  async getLoanById(id: number): Promise<Loan> {
    return await Loan.findOneOrFail({ where: { id } })
  }

  async getLoans(args: GetLoansArgs): Promise<PaginatedLoanResponse> {
    const where: any = {
      state: args?.filter?.type,
      lenderWallet: args?.filter?.lenderWallet,
      borrowerNoteMint: args?.filter?.borrowerWallet,
    }

    if (args?.filter?.orderBookPubKey) {
      where["orderBook"] = {
        pubKey: args?.filter?.orderBookPubKey,
      }
    }

    let order

    switch (args?.sort?.type) {
      case LoanSortType.Amount:
        order = { principalLamports: args?.sort?.order ?? SortOrder.Desc }
        break
      case LoanSortType.Time:
        order = args?.filter?.type === LoanType.Offer ? { offerTime: args?.sort?.order ?? SortOrder.Desc } : { start: args?.sort?.order ?? SortOrder.Desc }
        break
      default:
        order = { principalLamports: args?.sort?.order ?? SortOrder.Desc }
        break
    }

    const loans = await Loan.find({
      take: args?.pagination?.limit,
      skip: args?.pagination?.offset,
      where,
      order,
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

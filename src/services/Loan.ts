import { GetLoansArgs, LoanSortType, LoanType, PaginatedLoanResponse, SortOrder } from "../types"
import { Loan, OrderBook } from "../entities"
import { Service } from "typedi"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

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

    let totalOffers
    let totalActive
    let offerCount
    let activeCount

    if (args?.filter?.orderBookId || args?.filter?.orderBookPubKey) {
      offerCount = await Loan.count({ where: { state: LoanType.Offer, orderBook: { id: args?.filter?.orderBookId, pubKey: args?.filter?.orderBookPubKey } } })
      activeCount = await Loan.count({ where: { state: LoanType.Taken, orderBook: { id: args?.filter?.orderBookId, pubKey: args?.filter?.orderBookPubKey } } })
    }

    if (args?.filter?.orderBookPubKey) {
      where["orderBook"] = {
        pubKey: args?.filter?.orderBookPubKey,
      }

      const orderBook = await OrderBook.findOneBy({ pubKey: args?.filter?.orderBookPubKey })

      const loanQuery = Loan.createQueryBuilder("loan")
        .select("SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)", "totalOffers")
        .addSelect("SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)", "totalActive")
        .where("loan.orderBookId = :id", { id: orderBook?.id })
        .setParameter("offer", LoanType.Offer)
        .setParameter("taken", LoanType.Taken)

      const [result] = await loanQuery.getRawMany()
      const { totalOffers: offers, totalActive: active } = result

      totalOffers = parseFloat(offers ?? 0) / LAMPORTS_PER_SOL
      totalActive = parseFloat(active ?? 0) / LAMPORTS_PER_SOL
    }

    if (args?.filter?.orderBookId) {
      where["orderBook"] = {
        id: args?.filter?.orderBookId,
      }

      const loanQuery = Loan.createQueryBuilder("loan")
        .select("SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)", "totalOffers")
        .addSelect("SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)", "totalActive")
        .where("loan.orderBookId = :id", { id: args?.filter?.orderBookId })
        .setParameter("offer", LoanType.Offer)
        .setParameter("taken", LoanType.Taken)

      const [result] = await loanQuery.getRawMany()
      const { totalOffers: offers, totalActive: active } = result

      totalOffers = parseFloat(offers ?? 0) / LAMPORTS_PER_SOL
      totalActive = parseFloat(active ?? 0) / LAMPORTS_PER_SOL
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
      totalActive,
      totalOffers,
      offerCount,
      activeCount,
    }
  }
}

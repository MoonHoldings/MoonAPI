import { GetLoansArgs, HistoricalLoanResponse, HistoricalLoanStatus, LoanSortType, LoanType, PaginatedLoanResponse, SortOrder } from '../types'
import { Loan, OrderBook } from '../entities'
import axios from 'axios'
import { In } from 'typeorm'
import { addSeconds, differenceInSeconds } from 'date-fns'

import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AXIOS_CONFIG_HELLO_MOON_KEY, HELLO_MOON_URL } from '../constants'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'

export const getLoanById = async (id: number): Promise<Loan> => {
  return await Loan.findOneOrFail({ where: { id } })
}

export const getLoans = async (args: GetLoansArgs): Promise<PaginatedLoanResponse> => {
  let where: any = {
    state: args?.filter?.type,
  }

  const lenderWallet = args.filter?.lenderWallet
  const borrowerWallet = args?.filter?.borrowerWallet

  if (args.filter?.lenderWallet) {
    where = [
      {
        lenderWallet,
        state: args?.filter?.type,
      },
      {
        lenderNoteMint: lenderWallet,
        state: args?.filter?.type,
      },
    ]
  }

  if (borrowerWallet) {
    where = {
      borrowerNoteMint: borrowerWallet,
      state: args?.filter?.type,
    }
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
    where['orderBook'] = {
      pubKey: args?.filter?.orderBookPubKey,
    }

    const orderBook = await OrderBook.findOneBy({ pubKey: args?.filter?.orderBookPubKey })

    const loanQuery = Loan.createQueryBuilder('loan')
      .select('SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)', 'totalOffers')
      .addSelect('SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)', 'totalActive')
      .where('loan.orderBookId = :id', { id: orderBook?.id })
      .setParameter('offer', LoanType.Offer)
      .setParameter('taken', LoanType.Taken)

    const [result] = await loanQuery.getRawMany()
    const { totalOffers: offers, totalActive: active } = result

    totalOffers = parseFloat(offers ?? 0) / LAMPORTS_PER_SOL
    totalActive = parseFloat(active ?? 0) / LAMPORTS_PER_SOL
  }

  if (args?.filter?.orderBookId) {
    where['orderBook'] = {
      id: args?.filter?.orderBookId,
    }

    const loanQuery = Loan.createQueryBuilder('loan')
      .select('SUM(CASE WHEN loan.state = :offer THEN loan.principalLamports ELSE 0 END)', 'totalOffers')
      .addSelect('SUM(CASE WHEN loan.state = :taken THEN loan.principalLamports ELSE 0 END)', 'totalActive')
      .where('loan.orderBookId = :id', { id: args?.filter?.orderBookId })
      .setParameter('offer', LoanType.Offer)
      .setParameter('taken', LoanType.Taken)

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

export const getHistoricalLoansByUser = async (borrower?: string, lender?: string, offerBlocktime?: number): Promise<HistoricalLoanResponse[] | null> => {
  const getRemainingDays = (start: number, duration: number) => {
    const startTime = new Date(start * 1000)
    const endTime = addSeconds(startTime, duration)

    const remainingSeconds = differenceInSeconds(endTime, new Date())
    const remainingDays = remainingSeconds / 86400

    return Math.floor(remainingDays)
  }

  const getPercentDaysProgress = (start: number, duration: number) => {
    const currentUnixTime = Math.floor(Date.now() / 1000)

    return ((currentUnixTime - start) / duration) * 100
  }

  const formatElapsedTime = (unixTime: number) => {
    const currentUnixTime = Math.floor(Date.now() / 1000)
    let timePassed
    let unit

    const secondsPassed = currentUnixTime - unixTime

    if (secondsPassed < 60) {
      timePassed = secondsPassed
      unit = 'second'
    } else if (secondsPassed < 3600) {
      timePassed = Math.floor(secondsPassed / 60)
      unit = 'minute'
    } else if (secondsPassed < 86400) {
      timePassed = Math.floor(secondsPassed / 3600)
      unit = 'hour'
    } else if (secondsPassed < 2592000) {
      timePassed = Math.floor(secondsPassed / 86400)
      unit = 'day'
    } else {
      timePassed = Math.floor(secondsPassed / 2592000)
      unit = 'month'
    }

    if (timePassed !== 1) {
      unit += 's'
    }

    return `${timePassed} ${unit} ago`
  }

  const { data: loans } = await axios.post(
    `${HELLO_MOON_URL}/sharky/loan-summary`,
    {
      offerBlocktime: offerBlocktime && {
        operator: '<',
        value: offerBlocktime,
      },
      borrower,
      lender,
      limit: 100,
    },
    AXIOS_CONFIG_HELLO_MOON_KEY
  )

  let historicalLoans = loans.data

  if (lender) {
    historicalLoans = historicalLoans.filter((loan: HistoricalLoanResponse) => (loan.takenBlocktime && !loan.repayBlocktime) || loan.repayBlocktime)
  } else if (borrower) {
    historicalLoans = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.repayBlocktime)
  }

  const orderBooks = await OrderBook.find({ where: { pubKey: In(historicalLoans.map((loan: HistoricalLoanResponse) => loan.orderBook)) }, relations: { nftList: true } })
  const orderBooksByPubKey = orderBooks.reduce((accumulator: any, orderBook) => {
    accumulator[orderBook.pubKey] = orderBook
    return accumulator
  }, {})

  historicalLoans = historicalLoans.map((loan: HistoricalLoanResponse) => {
    const orderBook: OrderBook = orderBooksByPubKey[loan.orderBook]
    let offerInterest = null
    let borrowInterest = null

    if (orderBook) {
      offerInterest = calculateOfferInterest(loan.amountOffered, orderBook.duration, orderBook.apy, orderBook.feePermillicentage)
      borrowInterest = calculateBorrowInterest(loan.amountOffered, orderBook.duration, orderBook.apy)
    }

    let status = HistoricalLoanStatus.Repaid

    if ((loan.takenBlocktime || loan.extendBlocktime) && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Active
    }

    const remainingDays = getRemainingDays(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds)
    const daysPercentProgress = status === HistoricalLoanStatus.Active ? getPercentDaysProgress(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds) : null

    if (remainingDays < 1 && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Foreclosed
    }

    return {
      ...loan,
      offerInterest,
      borrowInterest,
      apy: orderBook.apyAfterFee(),
      collectionName: orderBook.nftList?.collectionName,
      collectionImage: orderBook.nftList?.collectionImage,
      status,
      remainingDays: remainingDays,
      daysPercentProgress,
      repayElapsedTime: status === HistoricalLoanStatus.Repaid ? formatElapsedTime(loan.repayBlocktime) : null,
      foreclosedElapsedTime: status === HistoricalLoanStatus.Foreclosed ? formatElapsedTime(loan.takenBlocktime + loan.loanDurationSeconds) : null,
    }
  })

  const active = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Active).sort((a: any, b: any) => a.remainingDays - b.remainingDays)
  const repaid = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Repaid).sort((a: any, b: any) => b.repayBlocktime - a.repayBlocktime)
  const foreclosed = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Foreclosed).sort((a: any, b: any) => b.takenBlocktime - a.takenBlocktime)

  return [...active, ...repaid, ...foreclosed]
}

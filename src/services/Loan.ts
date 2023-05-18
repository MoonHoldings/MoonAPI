import {
  BorrowLoan,
  CreateLoan,
  GetLoansArgs,
  HistoricalLoanResponse,
  HistoricalLoanStatus,
  LoanSortType,
  LoanType,
  PaginatedHistoricalLoanResponse,
  PaginatedLoanResponse,
  SortOrder,
  TotalLoanResponse,
} from '../types'
import { Loan, OrderBook } from '../entities'
import axios from 'axios'
import { In, LessThan, Not } from 'typeorm'
import { addSeconds, differenceInSeconds, format } from 'date-fns'

import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AXIOS_CONFIG_HELLO_MOON_KEY, HELLO_MOON_URL } from '../constants'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import sharkyClient from '../utils/sharkyClient'

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

export const getLoanById = async (id: number): Promise<Loan> => {
  return await Loan.findOneOrFail({ where: { id } })
}

export const getTotalLendsByAddress = async (address: string): Promise<TotalLoanResponse> => {
  let paginationToken = true
  let total = 0
  let loans: any[] = []
  const currentUnixTime = Math.floor(Date.now() / 1000)

  while (paginationToken) {
    const { data }: { data: any } = await axios.post(
      `${HELLO_MOON_URL}/sharky/loan-summary`,
      {
        takenBlocktime: {
          operator: '<',
          value: currentUnixTime,
        },
        lender: address,
        paginationToken: paginationToken !== true ? paginationToken : null,
        limit: 100,
      },
      AXIOS_CONFIG_HELLO_MOON_KEY
    )

    paginationToken = data.paginationToken
    loans = [...loans, ...data?.data?.filter((loan: any) => loan.takenBlocktime && !loan.repayBlocktime)]

    total += data?.data
      ?.filter((loan: any) => loan.takenBlocktime && !loan.repayBlocktime)
      ?.reduce((accumulator: number, loan: any) => {
        return accumulator + loan.amountOffered
      }, 0)
  }

  const orderBookPubKeys = loans.map((loan) => loan.orderBook)
  const orderBooks = await OrderBook.find({ select: ['pubKey', 'apy', 'feePermillicentage'], where: { pubKey: In(orderBookPubKeys) } })
  const orderBooksByPubKey: Record<string, OrderBook> = orderBooks.reduce((accumulator: any, orderBook) => {
    accumulator[orderBook.pubKey] = orderBook
    return accumulator
  }, {})

  let totalInterest = 0

  for (const loan of loans) {
    const orderBook = orderBooksByPubKey[loan.orderBook]
    totalInterest += calculateOfferInterest(loan.amountOffered, loan.loanDurationSeconds, orderBook.apy, orderBook.feePermillicentage)
  }

  return {
    total,
    interest: totalInterest,
  }
}

export const getTotalBorrowsByAddress = async (address: string): Promise<TotalLoanResponse> => {
  let paginationToken = true
  let total = 0
  let loans: any[] = []
  const currentUnixTime = Math.floor(Date.now() / 1000)

  while (paginationToken) {
    const { data }: { data: any } = await axios.post(
      `${HELLO_MOON_URL}/sharky/loan-summary`,
      {
        takenBlocktime: {
          operator: '<',
          value: currentUnixTime,
        },
        borrower: address,
        paginationToken: paginationToken !== true ? paginationToken : null,
        limit: 100,
      },
      AXIOS_CONFIG_HELLO_MOON_KEY
    )

    paginationToken = data.paginationToken
    loans = [...loans, ...data?.data?.filter((loan: any) => loan.takenBlocktime && !loan.repayBlocktime)]

    total += data?.data
      ?.filter((loan: any) => loan.takenBlocktime && !loan.repayBlocktime)
      ?.reduce((accumulator: number, loan: any) => {
        return accumulator + loan.amountOffered
      }, 0)
  }

  const orderBookPubKeys = loans.map((loan) => loan.orderBook)
  const orderBooks = await OrderBook.find({ select: ['pubKey', 'apy', 'feePermillicentage'], where: { pubKey: In(orderBookPubKeys) } })
  const orderBooksByPubKey: Record<string, OrderBook> = orderBooks.reduce((accumulator: any, orderBook) => {
    accumulator[orderBook.pubKey] = orderBook
    return accumulator
  }, {})

  let totalInterest = 0

  for (const loan of loans) {
    const orderBook = orderBooksByPubKey[loan.orderBook]
    totalInterest += calculateBorrowInterest(loan.amountOffered, loan.loanDurationSeconds, orderBook.apy)
  }

  return {
    total,
    interest: totalInterest,
  }
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

export const getLoanSummary = async (borrower?: string, lender?: string, paginationToken?: string): Promise<PaginatedHistoricalLoanResponse> => {
  const { data: loans } = await axios.post(
    `${HELLO_MOON_URL}/sharky/loan-summary`,
    {
      borrower,
      lender,
      limit: 100,
      paginationToken,
    },
    AXIOS_CONFIG_HELLO_MOON_KEY
  )

  let historicalLoans = loans.data

  const orderBooks = await OrderBook.find({ where: { pubKey: In(historicalLoans.map((loan: HistoricalLoanResponse) => loan.orderBook)) }, relations: { nftList: true } })
  const orderBooksByPubKey = orderBooks.reduce((accumulator: any, orderBook) => {
    accumulator[orderBook.pubKey] = orderBook
    return accumulator
  }, {})

  const loanCollateralMints: string[] = historicalLoans.map((loan: any) => loan.collateralMint).filter((mint: string) => mint !== null)
  let collateralMetadataByMint: Record<string, any> = []

  if (loanCollateralMints.length) {
    // Fetch collection image via nftMint
    const { data } = await axios.post(
      `${HELLO_MOON_URL}/nft/mint_information`,
      {
        nftMint: loanCollateralMints,
      },
      AXIOS_CONFIG_HELLO_MOON_KEY
    )

    if (data?.data?.length) {
      collateralMetadataByMint = data.data.reduce((accumulator: any, metadata: any) => {
        accumulator[metadata.nftMint] = metadata
        return accumulator
      }, {})
    }
  }

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

    if (loan.offerBlocktime && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Offered
    }

    if (loan.takenBlocktime && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Taken
    }

    const remainingDays = getRemainingDays(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds)
    const daysPercentProgress = status === HistoricalLoanStatus.Active ? getPercentDaysProgress(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds) : null

    if (remainingDays < 1 && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Foreclosed
    }

    if (loan.cancelBlocktime) {
      status = HistoricalLoanStatus.Canceled
    }

    return {
      ...loan,
      offerInterest,
      borrowInterest,
      apy: orderBook.apyAfterFee(),
      collectionName: orderBook.nftList?.collectionName,
      collectionImage: orderBook.nftList?.collectionImage,
      collateralName: collateralMetadataByMint[loan.collateralMint]?.nftMetadataJson?.name,
      status,
      remainingDays: remainingDays ? remainingDays : null,
      daysPercentProgress,
      repayElapsedTime: status === HistoricalLoanStatus.Repaid ? formatElapsedTime(loan.repayBlocktime) : null,
      foreclosedElapsedTime: status === HistoricalLoanStatus.Foreclosed ? formatElapsedTime(loan.takenBlocktime + loan.loanDurationSeconds) : null,
      canceledElapsedTime: status === HistoricalLoanStatus.Canceled ? formatElapsedTime(loan.cancelBlocktime) : null,
    }
  })

  return {
    data: historicalLoans,
    paginationToken: loans.paginationToken,
  }
}

export const getHistoricalLoansByUser = async (borrower?: string, lender?: string, offerBlocktime?: number): Promise<HistoricalLoanResponse[] | null> => {
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
  let paginationToken = loans.paginationToken

  if (lender) {
    historicalLoans = historicalLoans.filter((loan: HistoricalLoanResponse) => (loan.takenBlocktime && !loan.repayBlocktime) || loan.repayBlocktime)
  } else if (borrower) {
    historicalLoans = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.repayBlocktime)
  }

  // Check if filtered historical loans is less than 100, fetch more if it is
  while (historicalLoans.length < 100 && paginationToken) {
    const { data } = await axios.post(
      `${HELLO_MOON_URL}/sharky/loan-summary`,
      {
        borrower,
        lender,
        paginationToken: paginationToken,
        limit: 100,
      },
      AXIOS_CONFIG_HELLO_MOON_KEY
    )

    paginationToken = data.paginationToken
    let filteredHistoricalLoans = []

    if (lender) {
      filteredHistoricalLoans = data.data.filter((loan: HistoricalLoanResponse) => (loan.takenBlocktime && !loan.repayBlocktime) || loan.repayBlocktime)
    } else if (borrower) {
      filteredHistoricalLoans = data.data.filter((loan: HistoricalLoanResponse) => loan.repayBlocktime)
    }

    if (filteredHistoricalLoans) {
      historicalLoans = [...historicalLoans, ...filteredHistoricalLoans]
    }
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

    if (((loan.takenBlocktime || loan.extendBlocktime) && !loan.repayBlocktime) || (loan.offerBlocktime && !loan.repayBlocktime)) {
      status = HistoricalLoanStatus.Active
    }

    const remainingDays = getRemainingDays(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds)
    const daysPercentProgress = status === HistoricalLoanStatus.Active ? getPercentDaysProgress(loan.extendBlocktime ? loan.extendBlocktime : loan.takenBlocktime, loan.loanDurationSeconds) : null

    if (remainingDays < 1 && !loan.repayBlocktime) {
      status = HistoricalLoanStatus.Foreclosed
    }

    if (loan.cancelBlocktime) {
      status = HistoricalLoanStatus.Canceled
    }

    return {
      ...loan,
      offerInterest,
      borrowInterest,
      apy: orderBook.apyAfterFee(),
      collectionName: orderBook.nftList?.collectionName,
      collectionImage: orderBook.nftList?.collectionImage,
      status,
      remainingDays: remainingDays ? remainingDays : null,
      daysPercentProgress,
      repayElapsedTime: status === HistoricalLoanStatus.Repaid ? formatElapsedTime(loan.repayBlocktime) : null,
      foreclosedElapsedTime: status === HistoricalLoanStatus.Foreclosed ? formatElapsedTime(loan.takenBlocktime + loan.loanDurationSeconds) : null,
      canceledElapsedTime: status === HistoricalLoanStatus.Canceled ? formatElapsedTime(loan.cancelBlocktime) : null,
    }
  })

  const active = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Active).sort((a: any, b: any) => a.remainingDays - b.remainingDays)
  const repaid = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Repaid).sort((a: any, b: any) => b.repayBlocktime - a.repayBlocktime)
  const foreclosed = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Foreclosed).sort((a: any, b: any) => b.takenBlocktime - a.takenBlocktime)
  // const canceled = historicalLoans.filter((loan: HistoricalLoanResponse) => loan.status === HistoricalLoanStatus.Canceled).sort((a: any, b: any) => b.offerBlocktime - a.offerBlocktime)

  return [...active, ...repaid, ...foreclosed]
}

export const createLoans = async (loans: CreateLoan[]): Promise<Loan[]> => {
  const orderBooks = await OrderBook.find({ select: ['id', 'pubKey'], where: { pubKey: In(loans.map((loan) => loan.orderBook)) } })
  const orderBooksByPubKey: Record<string, OrderBook> = orderBooks.reduce((accumulator: any, orderBook) => {
    accumulator[orderBook.pubKey] = orderBook
    return accumulator
  }, {})

  const newLoans = loans.map((loan) => {
    const orderBook = orderBooksByPubKey[loan.orderBook]

    return Loan.create({
      ...loan,
      orderBook: { id: orderBook.id },
    })
  })

  await Loan.save(newLoans)

  return newLoans
}

export const borrowLoan = async (borrowedLoan: BorrowLoan): Promise<Loan | null> => {
  const loan = await Loan.findOne({ where: { pubKey: borrowedLoan.pubKey } })

  if (loan) {
    loan.lenderWallet = null
    loan.offerTime = null
    loan.nftCollateralMint = borrowedLoan.nftCollateralMint
    loan.lenderNoteMint = borrowedLoan.lenderNoteMint
    loan.borrowerNoteMint = borrowedLoan.borrowerNoteMint
    loan.apy = borrowedLoan.apy
    loan.start = borrowedLoan.start
    loan.totalOwedLamports = borrowedLoan.totalOwedLamports
    loan.state = LoanType.Taken

    await Loan.save(loan)
  }

  return loan
}

export const deleteLoanByPubKey = async (pubKey: string): Promise<string | null> => {
  try {
    const loan = await Loan.findOne({ where: { pubKey } })

    if (loan) {
      await loan.softRemove()

      return pubKey
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const saveLoans = async () => {
  console.log(format(new Date(), "'saveLoans start:' MMMM d, yyyy h:mma"))

  const loanRepository = Loan.getRepository()
  const orderBookRepository = OrderBook.getRepository()

  const { program } = sharkyClient
  let newLoans = await sharkyClient.fetchAllLoans({ program })
  let newLoansPubKeys = newLoans.map((loan) => loan.pubKey.toBase58())

  // Create new loans that are not yet created, and update existing ones
  const existingLoans = await loanRepository.find({ where: { pubKey: In(newLoansPubKeys) }, relations: { orderBook: true }, withDeleted: true })
  const existingLoansByPubKey = existingLoans.reduce((accumulator: any, loan) => {
    accumulator[loan.pubKey] = loan
    return accumulator
  }, {})

  const existingLoansPubKeys = new Set(existingLoans.map((loan) => loan.pubKey))

  const newlyAddedLoans = []
  const updatedLoanEntities = []

  for (const newLoan of newLoans) {
    if (!existingLoansPubKeys.has(newLoan.pubKey.toBase58())) {
      newlyAddedLoans.push(newLoan)
    } else {
      // If loan exists, check if state changed
      const newLoanPubKey = newLoan.pubKey.toBase58()
      const savedLoan: Loan = existingLoansByPubKey[newLoanPubKey]

      if (savedLoan) {
        if (!savedLoan.orderBook) {
          const orderBook = await OrderBook.findOne({ where: { pubKey: newLoan.data.orderBook.toBase58() } })

          if (orderBook) {
            savedLoan.orderBook = orderBook
            updatedLoanEntities.push(savedLoan)
          }
        }

        if (savedLoan.state === LoanType.Offer && newLoan.state === LoanType.Taken) {
          savedLoan.lenderWallet = newLoan.data.loanState.offer?.offer.lenderWallet.toBase58()
          savedLoan.offerTime = newLoan.data.loanState.offer?.offer.offerTime?.toNumber()
          savedLoan.nftCollateralMint = newLoan.data.loanState.taken?.taken.nftCollateralMint.toBase58()
          savedLoan.lenderNoteMint = newLoan.data.loanState.taken?.taken.lenderNoteMint.toBase58()
          savedLoan.borrowerNoteMint = newLoan.data.loanState.taken?.taken.borrowerNoteMint.toBase58()
          savedLoan.apy = newLoan.data.loanState.taken?.taken.apy.fixed?.apy
          savedLoan.start = newLoan.data.loanState.taken?.taken.terms.time?.start?.toNumber()
          savedLoan.totalOwedLamports = newLoan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber()
          savedLoan.state = newLoan.state

          updatedLoanEntities.push(savedLoan)
        }
      }
    }
  }

  const newlyAddedLoansOrderBookPubKeys = newlyAddedLoans.map((loan) => loan.data.orderBook.toBase58())
  const uniqueOrderBookPubKeys = newlyAddedLoansOrderBookPubKeys.filter((value, index, self) => {
    return self.indexOf(value) === index
  })

  if (newlyAddedLoans.length > 0) {
    const orderBooks = await orderBookRepository.find({ where: { pubKey: In(uniqueOrderBookPubKeys) } })

    const newLoanEntities = newlyAddedLoans.map((loan) => {
      const orderBook = orderBooks.find((orderBook) => loan.data.orderBook.toBase58() === orderBook.pubKey)

      return loanRepository.create({
        pubKey: loan.pubKey.toBase58(),
        version: loan.data.version,
        principalLamports: loan.data.principalLamports.toNumber(),
        valueTokenMint: loan.data.valueTokenMint.toBase58(),
        supportsFreezingCollateral: loan.supportsFreezingCollateral,
        isCollateralFrozen: loan.isCollateralFrozen,
        isHistorical: loan.isHistorical,
        isForeclosable: loan.isForeclosable(),
        state: loan.state,
        duration: loan.data.loanState?.offer?.offer.termsSpec.time?.duration?.toNumber() || loan.data.loanState.taken?.taken.terms.time?.duration?.toNumber(),
        lenderWallet: loan.data.loanState.offer?.offer.lenderWallet.toBase58(),
        offerTime: loan.data.loanState.offer?.offer.offerTime?.toNumber(),
        nftCollateralMint: loan.data.loanState.taken?.taken.nftCollateralMint.toBase58(),
        lenderNoteMint: loan.data.loanState.taken?.taken.lenderNoteMint.toBase58(),
        borrowerNoteMint: loan.data.loanState.taken?.taken.borrowerNoteMint.toBase58(),
        apy: loan.data.loanState.taken?.taken.apy.fixed?.apy,
        start: loan.data.loanState.taken?.taken.terms.time?.start?.toNumber(),
        totalOwedLamports: loan.data.loanState.taken?.taken.terms.time?.totalOwedLamports?.toNumber(),
        orderBook: orderBook,
      })
    })

    await loanRepository.save([...newLoanEntities, ...updatedLoanEntities], { chunk: Math.ceil((newLoanEntities.length + updatedLoanEntities.length) / 10) })
  }

  const timeBeforeFetch = new Date()
  // Delete loans that are not in the new loans
  const loansForDelete = await sharkyClient.fetchAllLoans({ program })
  // We only delete loans that are created before we fetch the new loans so that it doesn't delete loans created while old data is fetching
  const loansForDeletePubKeys = loansForDelete.map((loan) => loan.pubKey.toBase58())
  await loanRepository.softDelete({ pubKey: Not(In(loansForDeletePubKeys)), updatedAt: LessThan(timeBeforeFetch) })

  console.log(format(new Date(), "'saveLoans end:' MMMM d, yyyy h:mma"))
}

import { Between, In } from 'typeorm'
import * as Sentry from '@sentry/node'
import { Nft, WalletData, UserWallet, Loan } from '../entities'
import { TimeRangeType, UserDashboardResponse, UserWalletType, WalletDataType } from '../types'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'
import { getUserPortfolioCoins } from './Porfolio'
import { addDays, format } from 'date-fns'
import { getCoinsByWallet } from './Coin'
import getFXRatePyth from '../utils/getFXRatePyth'

export const getNftTotal = async (wallets: string[]): Promise<number> => {
  const userWallets = await UserWallet.find({ where: { address: In(wallets), type: UserWalletType.Auto, hidden: false } })
  const nfts = await Nft.find({ where: { owner: In(userWallets.map((wallet) => wallet.address)) }, relations: { collection: true } })

  const collectionsHash = nfts.reduce((hash: any, nft) => {
    if (nft.collection && nft.collection.floorPrice) {
      if (nft.collection?.id in hash) {
        hash[nft.collection?.id].count += 1
      } else {
        hash[nft.collection?.id] = {
          collection: nft.collection,
          count: 1,
        }
      }
    }

    return hash
  }, {})

  const total = Object.values(collectionsHash).reduce((currentTotal: number, userCollectionCount: any) => {
    return currentTotal + (userCollectionCount.collection.floorPrice / LAMPORTS_PER_SOL) * userCollectionCount.count
  }, 0)

  return total
}

export const getCryptoTotal = async (wallets: string[]): Promise<number> => {
  const portFolioCoins = await getUserPortfolioCoins(wallets)
  let totalPrice = 0

  portFolioCoins.forEach((coin) => {
    const price = parseFloat(coin.price.toString())
    const holdings = coin.holdings

    if (!isNaN(price) && !isNaN(holdings)) {
      totalPrice += price * holdings
    }
  })

  return totalPrice
}

export const getLoanTotal = async (wallets: string[]): Promise<number> => {
  const verifiedWallets = (await UserWallet.find({ where: { address: In(wallets), type: UserWalletType.Auto, hidden: false, verified: true } })).map((wallet) => wallet.address)
  const loans = await Loan.find({ where: { lenderWallet: In(verifiedWallets) }, relations: { orderBook: true } })
  let total = 0

  if (loans.length) {
    total = loans.reduce((accumulator: number, loan) => {
      return (
        accumulator +
        loan.principalLamports / LAMPORTS_PER_SOL +
        calculateOfferInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy, loan.orderBook.feePermillicentage) / LAMPORTS_PER_SOL
      )
    }, 0)
  }

  return total
}

export const getBorrowTotal = async (wallets: string[]): Promise<number> => {
  const verifiedWallets = (await UserWallet.find({ where: { address: In(wallets), type: UserWalletType.Auto, hidden: false, verified: true } })).map((wallet) => wallet.address)
  const loans = await Loan.find({ where: { borrowerNoteMint: In(verifiedWallets) }, relations: { orderBook: true } })
  let total = 0

  if (loans.length) {
    total = loans.reduce((accumulator: number, loan) => {
      return accumulator + loan.principalLamports / LAMPORTS_PER_SOL + calculateBorrowInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy) / LAMPORTS_PER_SOL
    }, 0)
  }

  return total
}

export const getTimeSeries = async (wallets: string[], type: WalletDataType, start: Date, end: Date): Promise<WalletData[]> => {
  const generateDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = []
    let currentDate = start

    while (currentDate <= end) {
      dates.push(currentDate)
      currentDate = addDays(currentDate, 1)
    }

    return dates
  }

  const findMissingDates = (dates: Date[], timeSeriesData: WalletData[]): Date[] => {
    const existingDates = timeSeriesData.map((data) => data.createdAt)

    return dates.filter((date) => !existingDates.includes(date))
  }

  const mergeDuplicateDates = (timeSeriesData: WalletData[]): WalletData[] => {
    const mergedData: WalletData[] = []
    const dateMap: Map<string, WalletData> = new Map()

    for (const data of timeSeriesData) {
      const dateString = format(new Date(data.createdAt), 'yyyy-MM-dd')

      if (dateMap.has(dateString)) {
        const existingData = dateMap.get(dateString)

        if (existingData) {
          let curTotal = parseFloat(existingData.total as any)
          curTotal += parseFloat(data.total as any)
          existingData.total = curTotal
        }
      } else {
        dateMap.set(dateString, data)
        mergedData.push(data)
      }
    }

    return mergedData
  }

  const timeSeriesData = await WalletData.find({ where: { wallet: { address: In(wallets) }, type, createdAt: Between(start, end) } })
  const datesInRange = generateDatesInRange(start, end)
  const missingDates = findMissingDates(datesInRange, timeSeriesData)

  const missingData = missingDates.map((date) => {
    return WalletData.create({
      createdAt: date,
      type,
      total: 0,
    })
  })

  const allData = [...timeSeriesData, ...missingData]
  const mergedData = mergeDuplicateDates(allData)

  return mergedData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export const getUserDashboard = async (timeRangeType: TimeRangeType, wallets: string[]): Promise<UserDashboardResponse> => {
  let startOfPreviousDay: Date
  let endOfPreviousDate: Date

  if (timeRangeType === TimeRangeType.Day) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    startOfPreviousDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0)
    endOfPreviousDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
  } else if (timeRangeType === TimeRangeType.Week) {
    const previousWeekStart = new Date()
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)
    startOfPreviousDay = new Date(previousWeekStart.getFullYear(), previousWeekStart.getMonth(), previousWeekStart.getDate(), 0, 0, 0)
    endOfPreviousDate = new Date(previousWeekStart.getFullYear(), previousWeekStart.getMonth(), previousWeekStart.getDate(), 23, 59, 59)
  } else if (timeRangeType === TimeRangeType.Month) {
    const previousMonthStart = new Date()
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)
    startOfPreviousDay = new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth(), 1, 0, 0, 0)
    endOfPreviousDate = new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth(), 0, 23, 59, 59)
  } else {
    throw new Error('Invalid time range type')
  }

  const previousDashboard = await WalletData.find({
    where: { wallet: { address: In(wallets) }, createdAt: Between(startOfPreviousDay, endOfPreviousDate) },
  })

  const prevNft = previousDashboard.find((data) => data.type === 'nft')
  const prevLoan = previousDashboard.find((data) => data.type === 'loan')
  const prevBorrow = previousDashboard.find((data) => data.type === 'borrow')
  const prevCrypto = previousDashboard.find((data) => data.type === 'crypto')

  const cryptoTotalPromise = getCryptoTotal(wallets)
  const nftTotalPromise = getNftTotal(wallets)
  const loanTotalPromise = getLoanTotal(wallets)
  const borrowTotalPromise = getBorrowTotal(wallets)
  const totalResults = await Promise.all([cryptoTotalPromise, nftTotalPromise, loanTotalPromise, borrowTotalPromise])

  const [cryptoTotal, nftTotal, loanTotal, borrowTotal] = totalResults

  const prevCryptoTotal = prevCrypto ? prevCrypto.total : 0
  const prevNftTotal = prevNft ? prevNft.total : 0
  const prevLoanTotal = prevLoan ? prevLoan.total : 0
  const prevBorrowTotal = prevBorrow ? prevBorrow.total : 0

  const fxRate = (await getFXRatePyth('SOL', 'USD')) ?? 1

  const total = cryptoTotal + nftTotal * fxRate + loanTotal * fxRate + borrowTotal * fxRate
  const prevTotal = parseFloat(prevCryptoTotal as any) + parseFloat(prevNftTotal as any) + parseFloat(prevLoanTotal as any) + parseFloat(prevBorrowTotal as any)

  return {
    crypto: {
      total: cryptoTotal,
      prevTotal: prevCryptoTotal,
    },
    nft: {
      total: nftTotal * fxRate,
      prevTotal: prevNftTotal,
    },
    loan: {
      total: loanTotal * fxRate,
      prevTotal: prevLoanTotal,
    },
    borrow: {
      total: borrowTotal * fxRate,
      prevTotal: prevBorrowTotal,
    },
    total,
    prevTotal,
  }
}

export const saveLoansDashboardData = async () => {
  try {
    const verifiedWallets = await UserWallet.find({ where: { type: UserWalletType.Auto, verified: true } })

    const walletLoansTotal = verifiedWallets.map(async (wallet) => {
      const loans = await Loan.find({ where: { lenderWallet: wallet.address }, relations: { orderBook: true } })
      let total = 0

      if (loans.length) {
        total = loans.reduce((accumulator: number, loan) => {
          return (
            accumulator +
            loan.principalLamports / LAMPORTS_PER_SOL +
            calculateOfferInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy, loan.orderBook.feePermillicentage) / LAMPORTS_PER_SOL
          )
        }, 0)
      }

      return {
        wallet,
        total,
      }
    })

    const walletsTotal = await Promise.all(walletLoansTotal)
    const fxRate = (await getFXRatePyth('SOL', 'USD')) ?? 1

    const walletData = walletsTotal.map((walletData) =>
      WalletData.create({
        total: walletData.total * fxRate,
        type: WalletDataType.Loan,
        wallet: walletData.wallet,
        assetId: 'USD',
      })
    )

    if (walletData.length) await WalletData.save(walletData)
  } catch (error) {
    Sentry.captureException(error)
  }
}

export const saveBorrowDashboardData = async () => {
  try {
    const verifiedWallets = await UserWallet.find({ where: { type: UserWalletType.Auto, verified: true } })

    const walletBorrowTotal = verifiedWallets.map(async (wallet) => {
      const loans = await Loan.find({ where: { borrowerNoteMint: wallet.address }, relations: { orderBook: true } })
      let total = 0

      if (loans.length) {
        total = loans.reduce((accumulator: number, loan) => {
          return accumulator + loan.principalLamports / LAMPORTS_PER_SOL + calculateBorrowInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy) / LAMPORTS_PER_SOL
        }, 0)
      }

      return {
        wallet,
        total,
      }
    })

    const walletsTotal = await Promise.all(walletBorrowTotal)
    const fxRate = (await getFXRatePyth('SOL', 'USD')) ?? 1

    const walletData = walletsTotal.map((walletData) =>
      WalletData.create({
        total: walletData.total * fxRate,
        type: WalletDataType.Borrow,
        wallet: walletData.wallet,
        assetId: 'USD',
      })
    )

    if (walletData.length) await WalletData.save(walletData)
  } catch (error) {
    Sentry.captureException(error)
  }
}

export const saveNftDashboardData = async () => {
  try {
    const userWallets = await UserWallet.find({ where: { type: UserWalletType.Auto } })

    const userNftValuePromises = userWallets.map(async (wallet) => {
      const nfts = await Nft.find({ where: { owner: wallet.address }, relations: { collection: true } })
      const collectionsHash = nfts.reduce((hash: any, nft) => {
        if (nft.collection && nft.collection.floorPrice) {
          if (nft.collection?.id in hash) {
            hash[nft.collection?.id].count += 1
          } else {
            hash[nft.collection?.id] = {
              collection: nft.collection,
              count: 1,
            }
          }
        }

        return hash
      }, {})

      const total = Object.values(collectionsHash).reduce((currentTotal: number, userCollectionCount: any) => {
        return currentTotal + (userCollectionCount.collection.floorPrice / LAMPORTS_PER_SOL) * userCollectionCount.count
      }, 0)

      return {
        wallet,
        total,
      }
    })

    const walletNftsTotal = await Promise.all(userNftValuePromises)
    const fxRate = (await getFXRatePyth('SOL', 'USD')) ?? 1

    const walletData = walletNftsTotal.map((walletNftTotal) =>
      WalletData.create({
        total: walletNftTotal.total * fxRate,
        type: WalletDataType.Nft,
        wallet: walletNftTotal.wallet,
        assetId: 'USD',
      })
    )

    if (walletData.length) await WalletData.save(walletData)
  } catch (error) {
    Sentry.captureException(error)
  }
}

export const saveCryptoDashboardData = async () => {
  try {
    const userWallets = await UserWallet.find()

    const userCryptoValuePromises = userWallets.map(async (wallet) => {
      const portfolioCoins = await getCoinsByWallet([wallet.address])
      let total = 0

      portfolioCoins.forEach((coin) => {
        const price = parseFloat(coin.price.toString())
        const holdings = coin.holdings

        if (!isNaN(price) && !isNaN(holdings)) {
          total += price * holdings
        }
      })

      return {
        wallet,
        total,
      }
    })

    const userCryptosTotal = await Promise.all(userCryptoValuePromises)

    const walletData = userCryptosTotal.map((userCryptoTotal) =>
      WalletData.create({
        total: userCryptoTotal.total,
        type: WalletDataType.Crypto,
        wallet: userCryptoTotal.wallet,
        assetId: 'USD',
      })
    )

    if (walletData.length) await WalletData.save(walletData)
  } catch (error) {
    Sentry.captureException(error)
  }
}

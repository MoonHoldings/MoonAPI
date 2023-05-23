import { Between, In } from 'typeorm'
import { Nft, User, UserDashboard, UserWallet, Loan } from '../entities'
import { TimeRangeType, UserDashboardResponse, UserWalletType } from '../types'
import * as userService from './User'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import calculateOfferInterest from '../utils/calculateOfferInterest'
import calculateBorrowInterest from '../utils/calculateBorrowInterest'

const calculatePercentageChange = (previousValue: number, currentValue: number): number => {
  const difference = currentValue - previousValue
  const percentageChange = (difference / Math.abs(previousValue == 0 ? 1 : previousValue)) * 100

  return percentageChange
}

const getNftTotal = async (user: User): Promise<number> => {
  const userWallets = await UserWallet.find({ where: { user: { id: user.id }, type: UserWalletType.Auto } })
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

const getLoanTotal = async (user: User): Promise<number> => {
  const verifiedWallets = (await UserWallet.find({ where: { user: { id: user.id }, verified: true } })).map((wallet) => wallet.address)
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

const getBorrowTotal = async (user: User): Promise<number> => {
  const verifiedWallets = (await UserWallet.find({ where: { user: { id: user.id }, verified: true } })).map((wallet) => wallet.address)
  const loans = await Loan.find({ where: { borrowerNoteMint: In(verifiedWallets) }, relations: { orderBook: true } })
  let total = 0

  if (loans.length) {
    total = loans.reduce((accumulator: number, loan) => {
      return accumulator + loan.principalLamports / LAMPORTS_PER_SOL + calculateBorrowInterest(loan.principalLamports, loan.orderBook.duration, loan.orderBook.apy) / LAMPORTS_PER_SOL
    }, 0)
  }

  return total
}

export const getUserDashboard = async (timeRangeType: TimeRangeType, userId: number): Promise<UserDashboardResponse> => {
  const user = await userService.getUserById(userId)

  if (user) {
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
      endOfPreviousDate = new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth() + 1, 0, 23, 59, 59)
    } else {
      throw new Error('Invalid time range type')
    }

    const previousDashboard = await UserDashboard.find({
      where: { user: { id: user.id }, createdAt: Between(startOfPreviousDay, endOfPreviousDate) },
    })

    const prevNft = previousDashboard.find((data) => data.type === 'nft')
    const prevLoan = previousDashboard.find((data) => data.type === 'loan')
    const prevBorrow = previousDashboard.find((data) => data.type === 'borrow')
    const prevCrypto = previousDashboard.find((data) => data.type === 'crypto')

    const cryptoTotalPromise = 0 // TODO: Crypto
    const nftTotalPromise = getNftTotal(user)
    const loanTotalPromise = getLoanTotal(user)
    const borrowTotalPromise = getBorrowTotal(user)
    const totalResults = await Promise.all([cryptoTotalPromise, nftTotalPromise, loanTotalPromise, borrowTotalPromise])

    const [cryptoTotal, nftTotal, loanTotal, borrowTotal] = totalResults

    const prevCryptoTotal = prevCrypto ? prevCrypto.total : 0
    const prevNftTotal = prevNft ? prevNft.total : 0
    const prevLoanTotal = prevLoan ? prevLoan.total : 0
    const prevBorrowTotal = prevBorrow ? prevBorrow.total : 0

    const total = cryptoTotal + nftTotal + loanTotal + borrowTotal
    const prevTotal = parseFloat(prevCryptoTotal as any) + parseFloat(prevNftTotal as any) + parseFloat(prevLoanTotal as any) + parseFloat(prevBorrowTotal as any)
    const percentChangeTotal = prevTotal === 0 ? 0 : calculatePercentageChange(prevTotal, total)

    return {
      crypto: {
        total: cryptoTotal,
        percentChange: prevCrypto ? calculatePercentageChange(prevCryptoTotal, cryptoTotal) : 0,
      },
      nft: {
        total: nftTotal,
        percentChange: prevNft ? calculatePercentageChange(prevNftTotal, nftTotal) : 0,
      },
      loan: {
        total: loanTotal,
        percentChange: prevLoan ? calculatePercentageChange(prevLoanTotal, loanTotal) : 0,
      },
      borrow: {
        total: borrowTotal,
        percentChange: prevBorrow ? calculatePercentageChange(prevBorrowTotal, borrowTotal) : 0,
      },
      percentChangeTotal,
    }
  }

  return {
    crypto: {
      total: 0,
      percentChange: 0,
    },
    nft: {
      total: 0,
      percentChange: 0,
    },
    loan: {
      total: 0,
      percentChange: 0,
    },
    borrow: {
      total: 0,
      percentChange: 0,
    },
    percentChangeTotal: 0,
  }
}

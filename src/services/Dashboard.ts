import { Between } from 'typeorm'
import { UserDashboard } from '../entities'
import { TimeRangeType, UserDashboardResponse } from '../types'
import * as userService from './User'

const calculatePercentageChange = (previousValue: number, currentValue: number): number => {
  const difference = currentValue - previousValue
  const percentageChange = (difference / Math.abs(previousValue)) * 100

  return percentageChange // Return the result rounded to 2 decimal places
}

export const getUserDashboard = async (timeRangeType: TimeRangeType, userId: number): Promise<UserDashboardResponse> => {
  const user = await userService.getUserById(userId)

  if (user) {
    let startOfPreviousDay: Date
    let endOfPreviousDate: Date
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    if (timeRangeType === TimeRangeType.Day) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      startOfPreviousDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0)
      endOfPreviousDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
    } else if (timeRangeType === TimeRangeType.Week) {
      const previousWeekStart = new Date()
      previousWeekStart.setDate(previousWeekStart.getDate() - 7)
      startOfPreviousDay = new Date(previousWeekStart.getFullYear(), previousWeekStart.getMonth(), previousWeekStart.getDate(), 0, 0, 0)
      endOfPreviousDate = new Date()
    } else if (timeRangeType === TimeRangeType.Month) {
      const previousMonthStart = new Date()
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1)
      startOfPreviousDay = new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth(), 1, 0, 0, 0)
      endOfPreviousDate = new Date(previousMonthStart.getFullYear(), previousMonthStart.getMonth() + 1, 0, 23, 59, 59)
    } else {
      throw new Error('Invalid time range type')
    }

    const dashboard = await UserDashboard.find({ where: { user: { id: user.id }, createdAt: Between(startOfDay, endOfDay) } })
    const previousDashboard = await UserDashboard.find({
      where: { user: { id: user.id }, createdAt: Between(startOfPreviousDay, endOfPreviousDate) },
    })

    const nft = dashboard.find((data) => data.type === 'nft')
    const loan = dashboard.find((data) => data.type === 'loan')
    const borrow = dashboard.find((data) => data.type === 'borrow')
    const crypto = dashboard.find((data) => data.type === 'crypto')

    const prevNft = previousDashboard.find((data) => data.type === 'nft')
    const prevLoan = previousDashboard.find((data) => data.type === 'loan')
    const prevBorrow = previousDashboard.find((data) => data.type === 'borrow')
    const prevCrypto = previousDashboard.find((data) => data.type === 'crypto')

    return {
      crypto: {
        total: crypto ? crypto.total : 0,
        percentChange: prevCrypto && crypto ? calculatePercentageChange(prevCrypto.total, crypto.total) : 0,
      },
      nft: {
        total: nft ? nft.total : 0,
        percentChange: prevNft && nft ? calculatePercentageChange(prevNft.total, nft.total) : 0,
      },
      loan: {
        total: loan ? loan.total : 0,
        percentChange: prevLoan && loan ? calculatePercentageChange(prevLoan.total, loan.total) : 0,
      },
      borrow: {
        total: borrow ? borrow.total : 0,
        percentChange: prevBorrow && borrow ? calculatePercentageChange(prevBorrow.total, borrow.total) : 0,
      },
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
  }
}

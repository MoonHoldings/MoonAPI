import { Arg, Query, Resolver } from 'type-graphql'
import * as dashboardService from '../services/Dashboard'
import { TimeRangeType, UserDashboardResponse, WalletDataType } from '../types'
import { WalletData } from '../entities'
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns'

@Resolver()
export class DashboardResolver {
  @Query(() => UserDashboardResponse)
  async getUserDashboard(@Arg('timeRangeType') timeRangeType: TimeRangeType, @Arg('wallets', () => [String]) wallets: string[]): Promise<UserDashboardResponse> {
    return await dashboardService.getUserDashboard(timeRangeType, wallets)
  }

  @Query(() => [WalletData])
  async getTimeSeries(@Arg('timeRangeType') timeRangeType: string, @Arg('type') type: WalletDataType, @Arg('wallets', () => [String]) wallets: string[]): Promise<WalletData[]> {
    const now = new Date()
    let start = startOfWeek(now, { weekStartsOn: 1 })
    let end = endOfWeek(now, { weekStartsOn: 1 })

    switch (timeRangeType) {
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
    }

    return await dashboardService.getTimeSeries(wallets, type, start, end)
  }
}

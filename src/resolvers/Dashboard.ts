import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'
import * as dashboardService from '../services/Dashboard'
import { TimeRangeType, UserDashboardResponse, WalletDataType } from '../types'
import { isAuth } from '../utils'
import { WalletData } from '../entities'
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns'

@Resolver()
export class DashboardResolver {
  @Query(() => UserDashboardResponse)
  @UseMiddleware(isAuth)
  async getUserDashboard(@Arg('timeRangeType') timeRangeType: TimeRangeType, @Ctx() context: any): Promise<UserDashboardResponse> {
    const { payload } = context
    return await dashboardService.getUserDashboard(timeRangeType, payload?.userId)
  }

  @Query(() => [WalletData])
  @UseMiddleware(isAuth)
  async getTimeSeries(@Arg('timeRangeType') timeRangeType: string, @Arg('type') type: WalletDataType, @Ctx() context: any): Promise<WalletData[]> {
    const { payload } = context

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

    return await dashboardService.getTimeSeries(payload?.userId, type, start, end)
  }
}

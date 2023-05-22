import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'
import * as dashboardService from '../services/Dashboard'
import { Context } from 'apollo-server-core'
import { TimeRangeType, UserDashboardResponse } from '../types'
import { isAuth } from '../utils'

@Resolver()
export class DashboardResolver {
  @Query(() => UserDashboardResponse)
  @UseMiddleware(isAuth)
  async getUserDashboard(@Arg('timeRangeType') timeRangeType: TimeRangeType, @Ctx() context: Context<any>): Promise<UserDashboardResponse> {
    const { payload } = context
    return await dashboardService.getUserDashboard(timeRangeType, payload?.userId)
  }
}

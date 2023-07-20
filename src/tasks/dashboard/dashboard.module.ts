import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { DashboardProcessor } from './dashboard.processor'
import { DashboardSchedule } from './dashboard.schedule'
import { entities, dataSourceConfig } from '../../utils/db'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QueueTypes } from '../../types/enums'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dashboard',
    }),
    BullBoardModule.forFeature({
      name: QueueTypes.Dashboard,
      adapter: BullAdapter,
    }),
    TypeOrmModule.forRoot(dataSourceConfig),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DashboardSchedule, DashboardProcessor],
})
export class DashboardModule {}

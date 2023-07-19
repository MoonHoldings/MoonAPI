import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { DashboardProcessor } from './dashboard.processor'
import { DashboardSchedule } from './dashboard.schedule'
import { entities, dataSourceConfig } from '../../utils/db'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'dashboard',
    }),
    TypeOrmModule.forRoot(dataSourceConfig),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DashboardSchedule, DashboardProcessor],
})
export class DashboardModule {}

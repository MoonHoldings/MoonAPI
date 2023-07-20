import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bull'
import { BullBoardModule } from '@bull-board/nestjs'
import { ExpressAdapter } from '@bull-board/express'
import { TasksModule } from './tasks/tasks.module'
import { DashboardModule } from './tasks/dashboard/dashboard.module'
import { SharkifyModule } from './tasks/sharkify/sharkify.module'
import 'reflect-metadata'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT as string),
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    TasksModule,
    DashboardModule,
    SharkifyModule,
  ],
})
export class AppModule {}

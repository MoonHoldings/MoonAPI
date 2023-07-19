import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bull'
import { TasksModule } from './tasks/tasks.module'
import { DashboardModule } from './tasks/dashboard/dashboard.module'
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
    TasksModule,
    DashboardModule,
  ],
})
export class AppModule {}

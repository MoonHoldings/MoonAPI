import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Cron } from '@nestjs/schedule'
import { QueueTypes } from '../../types/enums'

@Injectable()
export class DashboardSchedule {
  constructor(@InjectQueue(QueueTypes.Dashboard) private readonly queue: Queue) {}

  @Cron('0 0 * * *')
  async saveLoansDashboardData() {
    this.queue.add('saveLoansDashboardData')
  }

  @Cron('0 0 * * *')
  async saveBorrowDashboardData() {
    this.queue.add('saveBorrowDashboardData')
  }

  @Cron('0 0 * * *')
  async saveNftDashboardData() {
    this.queue.add('saveNftDashboardData')
  }

  @Cron('0 0 * * *')
  async saveCryptoDashboardData() {
    this.queue.add('saveCryptoDashboardData')
  }
}

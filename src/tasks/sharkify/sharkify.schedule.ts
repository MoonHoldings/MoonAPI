import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { QueueTypes } from '../../types/enums'

@Injectable()
export class SharkifySchedule {
  constructor(@InjectQueue(QueueTypes.Sharkify) private readonly queue: Queue) {}

  @Interval(120000) // Every 2 minutes
  async saveLoans() {
    this.queue.add('saveLoans')
  }

  @Interval(3600000) // Every hour
  async saveNftList() {
    this.queue.add('saveNftList')
  }

  @Interval(4500000) // Every 1 hour and 15 minutes
  async saveNftMints() {
    this.queue.add('saveNftMints')
  }

  @Interval(5400000) // Every 1 hour and 30 minutes
  async saveOrderBooks() {
    this.queue.add('saveOrderBooks')
  }

  @Interval(4500000) // Every hour
  async saveNftListImages() {
    this.queue.add('saveNftListImages')
  }

  @Interval(300000) // Every 5 mins
  async saveNftListFloorPrices() {
    this.queue.add('saveNftListFloorPrices')
  }
}

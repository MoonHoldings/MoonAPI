import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { SharkifyCommandsService } from './sharkify.commands.service'

@Injectable()
export class SharkifyService {
  constructor(private readonly sharkifyCommandsService: SharkifyCommandsService) {}

  @Interval(120000) // Every 2 minutes
  async saveLoans() {
    await this.sharkifyCommandsService.saveLoans()
  }

  @Interval(3600000) // Every hour
  async saveNftList() {
    await this.sharkifyCommandsService.saveNftList()
  }

  @Interval(4500000) // Every 1 hour and 15 minutes
  async saveNftMints() {
    await this.sharkifyCommandsService.saveNftMints()
  }

  @Interval(5400000) // Every 1 hour and 30 minutes
  async saveOrderBooks() {
    await this.sharkifyCommandsService.saveOrderBooks()
  }

  @Interval(4500000) // Every hour
  async saveNftListImages() {
    await this.sharkifyCommandsService.saveNftListImages()
  }

  @Interval(300000) // Every 5 mins
  async saveNftListFloorPrices() {
    await this.sharkifyCommandsService.saveNftListFloorPrices()
  }
}

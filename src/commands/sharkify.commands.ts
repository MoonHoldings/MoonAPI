import { Command } from 'nestjs-command'
import { Injectable } from '@nestjs/common'
import { SharkifyService } from '../tasks/sharkify.service'

@Injectable()
export class SharkifyCommands {
  constructor(private readonly sharkifyService: SharkifyService) {}

  @Command({
    command: 'initdb',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async initDb() {
    await this.sharkifyService.saveNftList()
    await this.sharkifyService.saveNftMints()
    await this.sharkifyService.saveOrderBooks()
    await this.sharkifyService.saveLoans()
    await this.sharkifyService.saveNftListImages()
    await this.sharkifyService.saveNftListFloorPrices()
  }

  @Command({
    command: 'save:loans',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async saveLoans() {
    await this.sharkifyService.saveLoans()
  }

  @Command({
    command: 'save:orderbooks',
    describe: 'Fetches all order books using sharkify client and saves in our database',
  })
  async saveOrderBooks() {
    await this.sharkifyService.saveOrderBooks()
  }

  @Command({
    command: 'save:nftlist',
    describe: 'Fetches all nft list using sharkify client and saves in our database',
  })
  async saveNftList() {
    await this.sharkifyService.saveNftList()
  }

  @Command({
    command: 'save:nftmints',
    describe: 'Fetches all nft mints using sharkify client and saves in our database',
  })
  async saveNftMints() {
    await this.sharkifyService.saveNftMints()
  }

  @Command({
    command: 'save:nftlistimages',
    describe: 'Fetches all nft list images using hello moon and shyft and saves in our database',
  })
  async saveNftListImages() {
    await this.sharkifyService.saveNftListImages()
  }

  @Command({
    command: 'save:nftlistprices',
    describe: 'Fetches all nft list floor prices using hello moon and saves in our database',
  })
  async saveNftListFloorPrices() {
    await this.sharkifyService.saveNftListFloorPrices()
  }
}

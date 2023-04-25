import { Command } from 'nestjs-command'
import { Injectable } from '@nestjs/common'
import { SharkifyCommandsService } from '../tasks/sharkify.commands.service'

@Injectable()
export class SharkifyCommands {
  constructor(private readonly sharkifyCommandsService: SharkifyCommandsService) {}

  @Command({
    command: 'initdb',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async initDb() {
    await this.sharkifyCommandsService.saveNftList()
    await this.sharkifyCommandsService.saveNftMints()
    await this.sharkifyCommandsService.saveOrderBooks()
    await this.sharkifyCommandsService.saveLoans()
    await this.sharkifyCommandsService.saveNftListImages()
    await this.sharkifyCommandsService.saveNftListFloorPrices()
  }

  @Command({
    command: 'save:loans',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async saveLoans() {
    await this.sharkifyCommandsService.saveLoans()
  }

  @Command({
    command: 'save:orderbooks',
    describe: 'Fetches all order books using sharkify client and saves in our database',
  })
  async saveOrderBooks() {
    await this.sharkifyCommandsService.saveOrderBooks()
  }

  @Command({
    command: 'save:nftlist',
    describe: 'Fetches all nft list using sharkify client and saves in our database',
  })
  async saveNftList() {
    await this.sharkifyCommandsService.saveNftList()
  }

  @Command({
    command: 'save:nftmints',
    describe: 'Fetches all nft mints using sharkify client and saves in our database',
  })
  async saveNftMints() {
    await this.sharkifyCommandsService.saveNftMints()
  }

  @Command({
    command: 'save:nftlistimages',
    describe: 'Fetches all nft list images using hello moon and shyft and saves in our database',
  })
  async saveNftListImages() {
    await this.sharkifyCommandsService.saveNftListImages()
  }

  @Command({
    command: 'save:nftlistprices',
    describe: 'Fetches all nft list floor prices using hello moon and saves in our database',
  })
  async saveNftListFloorPrices() {
    await this.sharkifyCommandsService.saveNftListFloorPrices()
  }
}

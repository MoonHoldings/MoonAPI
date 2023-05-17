import { Command } from 'nestjs-command'
import { Injectable } from '@nestjs/common'
import * as loanService from '../services/Loan'
import * as nftListService from '../services/NftList'
import * as nftMintService from '../services/NftMint'
import * as orderBookService from '../services/OrderBook'

@Injectable()
export class SharkifyCommands {
  @Command({
    command: 'initdb',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async initDb() {
    await nftListService.saveNftList()
    await nftMintService.saveNftMints()
    await orderBookService.saveOrderBooks()
    await loanService.saveLoans()
    await nftListService.saveNftListImages()
    await nftListService.saveNftListFloorPrices()
  }

  @Command({
    command: 'save:loans',
    describe: 'Fetches all loans using sharkify client and saves in our database',
  })
  async saveLoans() {
    await loanService.saveLoans()
  }

  @Command({
    command: 'save:nftlist',
    describe: 'Fetches all nft list using sharkify client and saves in our database',
  })
  async saveNftList() {
    await nftListService.saveNftList()
  }

  @Command({
    command: 'save:orderbooks',
    describe: 'Fetches all order books using sharkify client and saves in our database',
  })
  async saveOrderBooks() {
    await orderBookService.saveOrderBooks()
  }

  @Command({
    command: 'save:nftmints',
    describe: 'Fetches all nft mints using sharkify client and saves in our database',
  })
  async saveNftMints() {
    await nftMintService.saveNftMints()
  }

  @Command({
    command: 'save:nftlistimages',
    describe: 'Fetches all nft list images using hello moon and shyft and saves in our database',
  })
  async saveNftListImages() {
    await nftListService.saveNftListImages()
  }

  @Command({
    command: 'save:nftlistprices',
    describe: 'Fetches all nft list floor prices using hello moon and saves in our database',
  })
  async saveNftListFloorPrices() {
    await nftListService.saveNftListFloorPrices()
  }
}

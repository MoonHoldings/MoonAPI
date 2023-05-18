import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import * as loanService from '../services/Loan'
import * as nftListService from '../services/NftList'
import * as nftMintService from '../services/NftMint'
import * as orderBookService from '../services/OrderBook'

@Injectable()
export class SharkifyService {
  @Interval(120000) // Every 2 minutes
  async saveLoans() {
    await loanService.saveLoans()
  }

  @Interval(3600000) // Every hour
  async saveNftList() {
    await nftListService.saveNftList()
  }

  @Interval(4500000) // Every 1 hour and 15 minutes
  async saveNftMints() {
    await nftMintService.saveNftMints()
  }

  @Interval(5400000) // Every 1 hour and 30 minutes
  async saveOrderBooks() {
    await orderBookService.saveOrderBooks()
  }

  @Interval(4500000) // Every hour
  async saveNftListImages() {
    await nftListService.saveNftListImages()
  }

  @Interval(300000) // Every 5 mins
  async saveNftListFloorPrices() {
    await nftListService.saveNftListFloorPrices()
  }
}

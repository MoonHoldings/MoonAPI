import { Process, Processor } from '@nestjs/bull'
// import { Logger } from '@nestjs/common'
import { QueueTypes } from '../../types/enums'
import * as loanService from '../../services/Loan'
import * as nftListService from '../../services/NftList'
import * as nftMintService from '../../services/NftMint'
import * as orderBookService from '../../services/OrderBook'

@Processor(QueueTypes.Sharkify)
export class SharkifyProcessor {
  // private readonly logger = new Logger(SharkifyProcessor.name)

  @Process('saveLoans')
  async saveLoans() {
    await loanService.saveLoans()
  }

  @Process('saveNftList')
  async saveNftList() {
    await nftListService.saveNftList()
  }

  @Process('saveNftMints')
  async saveNftMints() {
    await nftMintService.saveNftMints()
  }

  @Process('saveOrderBooks')
  async saveOrderBooks() {
    await orderBookService.saveOrderBooks()
  }

  @Process('saveNftListImages')
  async saveNftListImages() {
    await nftListService.saveNftListImages()
  }

  @Process('saveNftListFloorPrices')
  async saveNftListFloorPrices() {
    await nftListService.saveNftListFloorPrices()
  }
}

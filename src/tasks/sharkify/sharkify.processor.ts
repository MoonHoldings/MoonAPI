import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { QueueTypes } from '../../types/enums'
import { format } from 'date-fns'
import * as loanService from '../../services/Loan'
import * as nftListService from '../../services/NftList'
import * as nftMintService from '../../services/NftMint'
import * as orderBookService from '../../services/OrderBook'

@Processor(QueueTypes.Sharkify)
export class SharkifyProcessor {
  private readonly logger = new Logger(SharkifyProcessor.name)

  @Process('saveLoans')
  async saveLoans() {
    this.logger.log(format(new Date(), "'saveLoans start:' MMMM d, yyyy h:mma"))
    await loanService.saveLoans()
    this.logger.log(format(new Date(), "'saveLoans end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveNftList')
  async saveNftList() {
    this.logger.log(format(new Date(), "'saveNftList start:' MMMM d, yyyy h:mma"))
    await nftListService.saveNftList()
    this.logger.log(format(new Date(), "'saveNftList end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveNftMints')
  async saveNftMints() {
    this.logger.log(format(new Date(), "'saveNftMints start:' MMMM d, yyyy h:mma"))
    await nftMintService.saveNftMints()
    this.logger.log(format(new Date(), "'saveNftMints end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveOrderBooks')
  async saveOrderBooks() {
    this.logger.log(format(new Date(), "'saveOrderBooks start:' MMMM d, yyyy h:mma"))
    await orderBookService.saveOrderBooks()
    this.logger.log(format(new Date(), "'saveOrderBooks end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveNftListImages')
  async saveNftListImages() {
    this.logger.log(format(new Date(), "'saveNftListImages start:' MMMM d, yyyy h:mma"))
    await nftListService.saveNftListImages()
    this.logger.log(format(new Date(), "'saveNftListImages end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveNftListFloorPrices')
  async saveNftListFloorPrices() {
    this.logger.log(format(new Date(), "'saveNftListFloorPrices start:' MMMM d, yyyy h:mma"))
    await nftListService.saveNftListFloorPrices()
    this.logger.log(format(new Date(), "'saveNftListFloorPrices end:' MMMM d, yyyy h:mma"))
  }
}

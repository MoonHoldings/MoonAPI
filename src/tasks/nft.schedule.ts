import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import * as nftService from '../services/Nft'

@Injectable()
export class NftSchedule {
  @Interval(120000) // Every 2 mins
  async saveNftCollectionFloorPrices() {
    await nftService.saveNftCollectionFloorPrices()
  }
}

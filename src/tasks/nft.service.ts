import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import * as nftService from '../services/Nft'

@Injectable()
export class NftService {
  @Interval(120000) // Every 2 mins
  async saveNftCollectionFloorPrices() {
    await nftService.saveNftCollectionFloorPrices()
  }
}

import { Injectable } from '@nestjs/common'
import { Interval, Timeout } from '@nestjs/schedule'
import * as nftService from '../services/Nft'

@Injectable()
export class NftService {
  @Interval(180000)
  async saveNftCollectionFloorPrices() {
    await nftService.saveNftCollectionFloorPrices()
  }
}

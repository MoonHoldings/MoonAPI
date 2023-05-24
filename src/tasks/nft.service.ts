import { Injectable } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { NftCollection } from '../entities'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { format } from 'date-fns'
import fetchHelloMoonCollectionIds from '../utils/fetchHelloMoonCollectionIds'
import fetchFloorPrice from '../utils/fetchFloorPrice'
import * as Sentry from '@sentry/node'

@Injectable()
export class NftService {
  constructor(
    // @ts-ignore
    @InjectRepository(NftCollection)
    private readonly nftCollectionRepository: Repository<NftCollection> // @ts-ignore
  ) {}

  @Interval(180000)
  async saveNftCollectionFloorPrices() {
    try {
      console.log(format(new Date(), "'saveNftCollectionFloorPrices start:' MMMM d, yyyy h:mma"))

      try {
        const nftCollections = await this.nftCollectionRepository.find()
        const nftMintToListMap: Record<string, NftCollection> = nftCollections.reduce((map: Record<string, NftCollection>, nftCollection) => {
          map[nftCollection.nftMint] = nftCollection
          return map
        }, {})

        const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(nftCollections.map((nftCollection) => nftCollection.nftMint))
        let allIds = [...collectionIds]
        let currentPaginationToken = paginationToken

        while (currentPaginationToken) {
          const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(
            nftCollections.map((nftCollection) => nftCollection.nftMint),
            currentPaginationToken
          )

          currentPaginationToken = paginationToken
          allIds = [...allIds, ...collectionIds]
        }

        const collectionIdToNftCollectionMap: Record<string, NftCollection> = {}

        allIds?.forEach((data: any) => {
          collectionIdToNftCollectionMap[data.helloMoonCollectionId] = nftMintToListMap[data.nftMint]
        })

        console.log('collectionIds', allIds.length)

        const promises = allIds.map(async (id: any) => {
          const { floorPriceLamports, helloMoonCollectionId } = (await fetchFloorPrice(id.helloMoonCollectionId)) ?? {}
          return { floorPriceLamports, helloMoonCollectionId }
        })

        const floorPrices = await Promise.all(promises)

        console.log('floorPrices', floorPrices.length)

        const nftCollectionsToSave: NftCollection[] = []

        for (const { floorPriceLamports, helloMoonCollectionId } of floorPrices) {
          if (floorPriceLamports && helloMoonCollectionId) {
            const nftCollection = collectionIdToNftCollectionMap[helloMoonCollectionId]

            nftCollection.floorPrice = floorPriceLamports
            nftCollectionsToSave.push(nftCollection)
          }
        }

        await this.nftCollectionRepository.save(nftCollectionsToSave)
      } catch (e) {
        console.log(e)
      }

      console.log(format(new Date(), "'saveNftCollectionFloorPrices end:' MMMM d, yyyy h:mma"))
    } catch (error) {
      Sentry.captureException(error)
    }
  }
}

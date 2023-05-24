import { format } from 'date-fns'
import sharkyClient from '../utils/sharkyClient'
import { In, IsNull } from 'typeorm'
import { NftList } from '../entities'
import axios from 'axios'
import { HELLO_MOON_URL, AXIOS_CONFIG_HELLO_MOON_KEY, SHYFT_URL, AXIOS_CONFIG_SHYFT_KEY } from '../constants'
import fetchHelloMoonCollectionIds from '../utils/fetchHelloMoonCollectionIds'
import fetchFloorPrice from '../utils/fetchFloorPrice'
import * as Sentry from '@sentry/node'

export const saveNftList = async () => {
  try {
    console.log(format(new Date(), "'saveNftList start:' MMMM d, yyyy h:mma"))

    const nftListRepository = NftList.getRepository()

    try {
      const { program } = sharkyClient

      const newNftLists = await sharkyClient.fetchAllNftLists({ program })
      const newNftListPubKeys = newNftLists.map((nftList) => nftList.pubKey.toBase58())
      const existingNftList = await nftListRepository.find({ select: ['pubKey'], where: { pubKey: In(newNftListPubKeys) } })
      const existingNftListPubKeys = new Set(existingNftList.map((nftList) => nftList.pubKey))
      const newlyAddedNftLists = []

      for (const newNftList of newNftLists) {
        if (!existingNftListPubKeys.has(newNftList.pubKey.toBase58())) {
          newlyAddedNftLists.push(newNftList)
        }
      }

      if (newlyAddedNftLists.length > 0) {
        const nftListEntities = newlyAddedNftLists.map((nftList) => {
          return nftListRepository.create({
            collectionName: nftList.collectionName,
            pubKey: nftList.pubKey.toBase58(),
            version: nftList.version,
            nftMint: nftList.mints[nftList.mints.length - 1].toBase58(),
          })
        })

        await nftListRepository.save(nftListEntities)
        console.log(`Added ${nftListEntities.length} new nft lists`)
      } else {
        console.log(`No new nft lists`)
      }
    } catch (e) {
      console.log('ERROR', e)
    }

    console.log(format(new Date(), "'saveNftList end:' MMMM d, yyyy h:mma"))
  } catch (error) {
    Sentry.captureException(error)
  }
}

export const saveNftListImages = async () => {
  try {
    console.log(format(new Date(), "'saveNftListImages start:' MMMM d, yyyy h:mma"))

    const nftListRepository = NftList.getRepository()

    try {
      const nftLists = await nftListRepository.find({ where: { collectionImage: IsNull() } })

      const imagePromises = nftLists.map(async (nftList) => {
        // Fetch collection image via nftMint
        const { data: mintInfo } = await axios.post(
          `${HELLO_MOON_URL}/nft/mint_information`,
          {
            nftMint: nftList?.nftMint,
          },
          AXIOS_CONFIG_HELLO_MOON_KEY
        )

        const nftMint = mintInfo?.data[0]?.nftCollectionMint

        if (nftMint) {
          const { data: metadata } = await axios.get(`${SHYFT_URL}/nft/read?network=mainnet-beta&token_address=${nftMint}`, AXIOS_CONFIG_SHYFT_KEY)
          nftList.collectionImage = metadata?.result?.cached_image_uri ?? metadata?.result?.image_uri
        }

        return Promise.resolve()
      })

      await Promise.allSettled(imagePromises)
      await nftListRepository.save(nftLists)
    } catch (e) {
      console.log('ERROR', e)
    }

    console.log(format(new Date(), "'saveNftListImages end:' MMMM d, yyyy h:mma"))
  } catch (error) {
    Sentry.captureException(error)
  }
}

export const saveNftListFloorPrices = async () => {
  try {
    console.log(format(new Date(), "'saveNftListPrices start:' MMMM d, yyyy h:mma"))

    const nftListRepository = NftList.getRepository()

    try {
      const nftLists = await nftListRepository.find()
      const nftMintToListMap: Record<string, NftList> = nftLists.reduce((map: Record<string, NftList>, nftList) => {
        map[nftList.nftMint] = nftList
        return map
      }, {})

      const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(nftLists.map((nftList) => nftList.nftMint))
      let allIds = [...collectionIds]
      let currentPaginationToken = paginationToken

      while (currentPaginationToken) {
        const { data: collectionIds, paginationToken } = await fetchHelloMoonCollectionIds(
          nftLists.map((nftList) => nftList.nftMint),
          currentPaginationToken
        )

        currentPaginationToken = paginationToken
        allIds = [...allIds, ...collectionIds]
      }

      const collectionIdToNftListMap: Record<string, NftList> = {}

      allIds?.forEach((data: any) => {
        collectionIdToNftListMap[data.helloMoonCollectionId] = nftMintToListMap[data.nftMint]
      })

      console.log('collectionIds', allIds.length)

      const promises = allIds.map(async (id: any) => {
        const { floorPriceLamports, helloMoonCollectionId } = (await fetchFloorPrice(id.helloMoonCollectionId)) ?? {}
        return { floorPriceLamports, helloMoonCollectionId }
      })

      const floorPrices = await Promise.all(promises)

      console.log('floorPrices', floorPrices.length)

      const nftListsToSave: NftList[] = []

      for (const { floorPriceLamports, helloMoonCollectionId } of floorPrices) {
        if (floorPriceLamports && helloMoonCollectionId) {
          const nftList = collectionIdToNftListMap[helloMoonCollectionId]

          nftList.floorPrice = floorPriceLamports
          nftListsToSave.push(nftList)
        }
      }

      await nftListRepository.save(nftListsToSave)
    } catch (e) {
      console.log('ERROR', e)
    }

    console.log(format(new Date(), "'saveNftListPrices end:' MMMM d, yyyy h:mma"))
  } catch (error) {
    Sentry.captureException(error)
  }
}

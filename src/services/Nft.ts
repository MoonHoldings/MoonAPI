import { In, Not } from 'typeorm'
import { Nft, NftCollection, UserWallet } from '../entities'
import { shyft } from '../utils/shyft'
import { UserWalletType } from '../types'
import * as Sentry from '@sentry/node'
import { format } from 'date-fns'
import fetchFloorPrice from '../utils/fetchFloorPrice'
import fetchHelloMoonCollectionIds from '../utils/fetchHelloMoonCollectionIds'

export const getUserNfts = async (wallets: string[]): Promise<Nft[]> => {
  const userWallets = await UserWallet.find({ where: { address: In(wallets), hidden: false, type: UserWalletType.Auto } })
  const nfts = await Nft.find({ where: { owner: In(userWallets.map((wallet) => wallet.address)) }, relations: { collection: true } })

  return nfts
}

export const saveNfts = async (wallet: string): Promise<boolean> => {
  try {
    const nfts = await shyft.nft.getNftByOwner({ owner: wallet })

    // Get unique collection names
    const collectionNameHash: Record<string, any> = {}
    nfts.forEach((nft) => {
      if (nft.collection.name) {
        collectionNameHash[nft.collection.name] = {
          image: nft.cached_image_uri ?? nft.image_uri,
          nftMint: nft.mint,
        }
      }
    })
    const collectionNames = Object.keys(collectionNameHash)

    // Get unique collection addresses
    const collectionAddressHash: Record<string, any> = {}
    nfts.forEach((nft) => {
      if (nft.collection.address) {
        collectionAddressHash[nft.collection.address] = {
          collection: nft.collection,
          nftMint: nft.mint,
        }
      }
    })
    const collectionAddresses = Object.keys(collectionAddressHash)

    // Query existing collections
    const existingCollections = await NftCollection.find({ where: [{ mint: In(collectionAddresses) }, { name: In(collectionNames) }] })

    // Fetch metadata of unique collection addresses that doesn't exist yet
    const notExistingCollectionAddresses = collectionAddresses.filter((address) => existingCollections.findIndex((collection) => collection.mint === address) === -1)
    let collectionEntities: NftCollection[] = []

    if (notExistingCollectionAddresses.length) {
      const metadataResults = notExistingCollectionAddresses.map(async (mint) => {
        const nft = await shyft.nft.getNftByMint({ mint })
        return nft
      })
      const metadata = (await Promise.allSettled(metadataResults)).filter((res) => res.status === 'fulfilled').map((res: any) => res?.value)
      collectionEntities = metadata.map((metadata: any) =>
        NftCollection.create({
          mint: metadata.mint,
          name: metadata?.name ?? metadata?.symbol,
          image: metadata?.cached_image_uri ?? metadata?.image_uri,
          nftMint: collectionAddressHash[metadata.mint].nftMint,
        })
      )
    }

    // Append names to the unique names
    // Note: These are collections that has no on-chain address, image used is the last nft fetched
    const notExistingCollectionNames = collectionNames
      .filter((name) => existingCollections.findIndex((collection) => collection.name === name) === -1)
      .filter((name) => collectionEntities.findIndex((collection) => collection.name === name) === -1)

    notExistingCollectionNames.forEach((name) => {
      collectionEntities.push(
        NftCollection.create({
          name,
          image: collectionNameHash[name].image,
          nftMint: collectionNameHash[name].nftMint,
        })
      )
    })

    // Save new collections
    await NftCollection.save(collectionEntities)

    // Save floor price
    await saveNftCollectionFloorPrices(collectionEntities)

    const nftCollectionEntities = await NftCollection.find({ where: [{ mint: In(collectionAddresses) }, { name: In(collectionNames) }] })
    const nftEntities = nfts.map((nft) => {
      const collection = nftCollectionEntities.find((collection) => collection?.mint === nft?.collection?.address || collection.name === nft?.collection?.name) ?? null

      return Nft.create({
        mint: nft.mint,
        attributes: JSON.stringify(nft.attributes),
        attributesArray: JSON.stringify(nft.attributes_array),
        owner: nft.owner,
        name: nft.name,
        symbol: nft.symbol,
        image: nft.cached_image_uri ?? nft.image_uri,
        description: nft.description,
        collection: collection,
      })
    })

    // Remove owner attribute to nfts that are not owned by the wallet anymore
    const nftsNotOwned = await Nft.find({ where: { owner: wallet, mint: Not(In(nftEntities.map((nft) => nft.mint))) } })
    const nftsNotOwnedUpdated = nftsNotOwned.map((nft) => ({
      ...nft,
      owner: null,
    }))

    if (nftsNotOwnedUpdated.length) await Nft.save(nftsNotOwnedUpdated)

    await Nft.upsert(nftEntities, { skipUpdateIfNoValuesChanged: true, conflictPaths: ['mint'] })
  } catch (error) {
    Sentry.captureException(error)
  }

  return true
}

export const saveNftCollectionFloorPrices = async (collections?: NftCollection[]) => {
  try {
    console.log(format(new Date(), "'saveNftCollectionFloorPrices start:' MMMM d, yyyy h:mma"))

    const nftCollectionRepository = NftCollection.getRepository()

    try {
      const nftCollections = collections ? await nftCollectionRepository.find({ where: { id: In(collections.map((collection) => collection.id)) } }) : await nftCollectionRepository.find()
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

      const promises = allIds.map(async (id: any) => {
        const { floorPriceLamports, helloMoonCollectionId } = (await fetchFloorPrice(id.helloMoonCollectionId)) ?? {}
        return { floorPriceLamports, helloMoonCollectionId }
      })

      const floorPrices = await Promise.all(promises)
      const nftCollectionsToSave: NftCollection[] = []

      for (const { floorPriceLamports, helloMoonCollectionId } of floorPrices) {
        if (floorPriceLamports && helloMoonCollectionId) {
          const nftCollection = collectionIdToNftCollectionMap[helloMoonCollectionId]

          nftCollection.floorPrice = floorPriceLamports
          nftCollectionsToSave.push(nftCollection)
        }
      }

      await nftCollectionRepository.save(nftCollectionsToSave)
    } catch (e) {
      console.log(e)
    }

    console.log(format(new Date(), "'saveNftCollectionFloorPrices end:' MMMM d, yyyy h:mma"))
  } catch (error) {
    Sentry.captureException(error)
  }
}

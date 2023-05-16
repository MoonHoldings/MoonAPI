import { In, Not } from 'typeorm'
import { Nft, NftCollection, UserWallet } from '../entities'
import { shyft } from '../utils/shyft'
import { CollectionInfo } from '@shyft-to/js'

export const getUserNfts = async (userId: number): Promise<Nft[]> => {
  const userWallets = await UserWallet.find({ where: { user: { id: userId }, hidden: false } })
  const nfts = await Nft.find({ where: { owner: In(userWallets.map((wallet) => wallet.address)) }, relations: { collection: true } })

  return nfts
}

export const saveNfts = async (wallet: string): Promise<boolean> => {
  const nfts = await shyft.nft.getNftByOwner({ owner: wallet })

  // Get unique collection names
  const collectionNameHash: Record<string, string> = {}
  nfts.forEach((nft) => {
    if (nft.collection.name) {
      collectionNameHash[nft.collection.name] = nft.cached_image_uri ?? nft.image_uri
    }
  })
  const collectionNames = Object.keys(collectionNameHash)

  // Get unique collection addresses
  const collectionAddressHash: Record<string, CollectionInfo> = {}
  nfts.forEach((nft) => {
    if (nft.collection.address) {
      collectionAddressHash[nft.collection.address] = nft.collection
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
      })
    )
  }

  // Append names to the unique names
  // Note: These are collections that has no on-chain address, image used is the last nft fetched
  const notExistingCollectionNames = collectionNames.filter((name) => existingCollections.findIndex((collection) => collection.name === name) === -1)
  notExistingCollectionNames.forEach((name) => {
    collectionEntities.push(
      NftCollection.create({
        name,
        image: collectionNameHash[name],
      })
    )
  })

  // Save new collections
  await NftCollection.save(collectionEntities)

  // TODO: Call worker to save floor prices

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
      image: nft.cached_animation_url ?? nft.image_uri,
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

  return true
}

import { In } from 'typeorm'
import { Nft, NftCollection } from '../entities'
import { shyft } from '../utils/shyft'

export const addUserWallet = async (wallet: string, verified: boolean, userId?: number): Promise<boolean> => {
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
  const collectionAddressHash: Record<string, string> = {}
  nfts.forEach((nft) => {
    if (nft.collection.address) {
      collectionAddressHash[nft.collection.address] = nft.collection.address
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

  // TODO: Save non-existing nfts, update nft ownership

  return true
}

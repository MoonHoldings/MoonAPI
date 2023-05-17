import { format } from 'date-fns'
import sharkyClient from '../utils/sharkyClient'
import { NftMint, NftList } from '../entities'

export const saveNftMints = async () => {
  console.log(format(new Date(), "'saveNftMints start:' MMMM d, yyyy h:mma"))

  const nftMintRepository = NftMint.getRepository()
  const nftListRepository = NftList.getRepository()

  try {
    const { program } = sharkyClient

    const nftLists = await sharkyClient.fetchAllNftLists({ program })
    const savedNftLists = await nftListRepository.find({ select: ['pubKey', 'id'] })
    const savedNftListsByPubKey = savedNftLists.reduce((accumulator: any, nftList) => {
      accumulator[nftList.pubKey] = nftList
      return accumulator
    }, {})

    for (const nftList of nftLists) {
      const mints = nftList.mints.map((mint) => mint.toBase58())
      const savedNftList: NftList = savedNftListsByPubKey[nftList.pubKey.toBase58()]

      if (savedNftList) {
        const { lastIndex } = await nftMintRepository
          .createQueryBuilder('nft_mint')
          .select('COALESCE(MAX(nft_mint.nftListIndex), 0)', 'lastIndex')
          .where('nft_mint.nftListId = :nftListId', { nftListId: savedNftList.id })
          .getRawOne()

        if (mints.length > lastIndex + 1) {
          const notExistingMints = lastIndex === 0 ? mints : mints.slice(lastIndex + 1)
          const mintEntities = notExistingMints.map((mint, index) =>
            nftMintRepository.create({
              mint,
              nftList: savedNftList,
              nftListIndex: lastIndex === 0 ? lastIndex + index : lastIndex + index + 1,
            })
          )

          console.log(`Saving mints of nftList: ${nftList.pubKey.toBase58()} (${format(new Date(), 'MMMM d, yyyy h:mma')})`)
          await nftMintRepository.save(mintEntities, { chunk: 500 })

          console.log(`Saved ${notExistingMints.length} new mints for ${nftList.pubKey.toBase58()}`)
        }
      }
    }
  } catch (e) {
    console.log('ERROR', e)
  }

  console.log(format(new Date(), "'saveNftMints end:' MMMM d, yyyy h:mma"))
}

import { GetOrderBooksArgs, OrderBookSortType, PaginatedOrderBookResponse, SortOrder } from '../types'
import { NftMint, OrderBook } from '../entities'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import apyAfterFee from '../utils/apyAfterFee'
import axios from 'axios'
import { SHYFT_URL, AXIOS_CONFIG_SHYFT_KEY } from '../constants'

export const getOrderBookById = async (id: number): Promise<OrderBook> => {
  return await OrderBook.findOneOrFail({
    where: { id },
    relations: {
      nftList: true,
      loans: true,
    },
  })
}

export const getOrderBooks = async (args: GetOrderBooksArgs): Promise<PaginatedOrderBookResponse> => {
  let query = OrderBook.createQueryBuilder('orderBook')
    .select('orderBook.id', 'id')
    .addSelect('orderBook.pubKey', 'pubKey')
    .addSelect('nftList.collectionName', 'collectionName')
    .addSelect('nftList.collectionImage', 'collectionImage')
    .addSelect('nftList.floorPrice', 'floorPrice')
    .addSelect('orderBook.apy', 'apy')
    .addSelect('orderBook.duration', 'duration')
    .addSelect('orderBook.feePermillicentage', 'feePermillicentage')
    .addSelect("COALESCE(SUM(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", 'totalpool')
    .addSelect("COALESCE(MAX(CASE WHEN loan.state = 'offered' THEN loan.principalLamports ELSE 0 END), 0)", 'bestoffer')
    .innerJoin('orderBook.nftList', 'nftList')
    .leftJoin('orderBook.loans', 'loan')

  if (args?.filter?.search) {
    query.where('nftList.collectionName ILIKE :name', { name: `%${args.filter.search}%` })
  }

  const count = await query.getCount()

  if (args?.pagination?.offset) {
    query.offset(args.pagination.offset)
  }

  if (args?.pagination?.limit) {
    query.limit(args.pagination.limit)
  }

  query.groupBy('orderBook.id, nftList.collectionName, nftList.collectionImage, nftList.floorPrice')

  switch (args?.sort?.type) {
    case OrderBookSortType.Apy:
      query.orderBy('apy', args?.sort?.order ?? SortOrder.Desc)
      break
    case OrderBookSortType.Collection:
      query.orderBy('nftList.collectionName', args?.sort?.order ?? SortOrder.Desc)
      break
    case OrderBookSortType.Duration:
      query.orderBy('duration', args?.sort?.order ?? SortOrder.Desc)
      break
    case OrderBookSortType.TotalPool:
      query.orderBy('totalpool', args?.sort?.order ?? SortOrder.Desc)
      break
    case OrderBookSortType.BestOffer:
      query.orderBy('bestoffer', args?.sort?.order ?? SortOrder.Desc)
      break
    default:
      query.orderBy('totalpool', args?.sort?.order ?? SortOrder.Desc)
      break
  }

  const rawData = await query.getRawMany()

  if (args?.borrowWalletAddress) {
    const { data } = await axios.get(`${SHYFT_URL}/nft/read_all?network=mainnet-beta&address=${args?.borrowWalletAddress}&refresh`, AXIOS_CONFIG_SHYFT_KEY)

    if (data?.result?.length > 0) {
      const ownedNftDetails = data.result
      const ownedNftMints = data.result.map(({ mint }: any) => mint)
      const orderBookIds = rawData.map(({ id }: any) => parseInt(id))

      const nftMints = await NftMint.createQueryBuilder('nft_mint')
        .select('nft_mint.mint', 'mint')
        .addSelect('nft_mint.nftListIndex', 'nftListIndex')
        .addSelect('order_book.id', 'orderBookId')
        .leftJoin('nft_mint.nftList', 'nft_list')
        .leftJoin('nft_list.orderBook', 'order_book')
        .where('nft_mint.mint IN (:...ownedNftMints)', { ownedNftMints })
        .andWhere('order_book.id IN (:...orderBookIds)', { orderBookIds })
        .getRawMany()

      const ownedNftsByMint = nftMints.reduce((map: any, { mint, nftListIndex }) => {
        const ownedNftDetail = ownedNftDetails.find(({ mint: ownedNftMint }: any) => ownedNftMint === mint)

        if (ownedNftDetail) {
          map[mint] = {
            mint: ownedNftDetail.mint,
            nftListIndex: nftListIndex,
            name: ownedNftDetail.name,
            symbol: ownedNftDetail.symbol,
            image: ownedNftDetail?.cached_image_uri ?? ownedNftDetail?.image_uri,
          }
        }

        return map
      }, {})

      for (const orderBook of rawData) {
        const nftMintsInOrderBook = nftMints.filter((nftMint: any) => parseInt(nftMint.orderBookId) === parseInt(orderBook.id))
        const ownedNfts = nftMintsInOrderBook.map(({ mint }) => ownedNftsByMint[mint]).filter(Boolean)

        if (ownedNfts.length > 0) {
          orderBook.ownedNfts = ownedNfts
        }
      }
    }
  }

  const orderBooks = rawData.map((orderBook) => ({
    id: orderBook.id,
    pubKey: orderBook.pubKey,
    apy: orderBook.apy,
    apyAfterFee: apyAfterFee(orderBook.apy, orderBook.duration, orderBook.feePermillicentage),
    duration: orderBook.duration,
    feePermillicentage: orderBook.feePermillicentage,
    collectionName: orderBook.collectionName,
    collectionImage: orderBook.collectionImage,
    floorPrice: orderBook.floorPrice,
    floorPriceSol: orderBook.floorPrice ? parseFloat(orderBook.floorPrice) / LAMPORTS_PER_SOL : undefined,
    totalPool: parseFloat(orderBook.totalpool) / LAMPORTS_PER_SOL,
    bestOffer: parseFloat(orderBook.bestoffer) / LAMPORTS_PER_SOL,
    ownedNfts: orderBook?.ownedNfts,
  }))

  return {
    count,
    data: orderBooks,
  }
}

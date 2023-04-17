import { GetOrderBooksArgs, OrderBookSortType, PaginatedOrderBookResponse, SortOrder } from '../types'
import { OrderBook } from '../entities'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import apyAfterFee from '../utils/apyAfterFee'

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
  }))

  return {
    count,
    data: orderBooks,
  }
}

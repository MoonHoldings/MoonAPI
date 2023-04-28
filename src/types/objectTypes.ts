import { Loan } from '../entities'
import { ObjectType, Field, Int } from 'type-graphql'

@ObjectType()
export class PaginatedLoanResponse {
  @Field(() => Int)
  count: number
  @Field(() => [Loan])
  data: Loan[]
  @Field(() => Number, { nullable: true })
  totalOffers?: number
  @Field(() => Number, { nullable: true })
  totalActive?: number
  @Field(() => Number, { nullable: true })
  offerCount?: number
  @Field(() => Number, { nullable: true })
  activeCount?: number
}

@ObjectType()
export class HistoricalLoanResponse {
  @Field({ nullable: true })
  offerBlocktime: number
  @Field({ nullable: true })
  cancelBlocktime: number
  @Field({ nullable: true })
  takenBlocktime: number
  @Field({ nullable: true })
  repayBlocktime: number
  @Field({ nullable: true })
  repayElapsedTime: string
  @Field({ nullable: true })
  foreclosedElapsedTime: string
  @Field({ nullable: true })
  defaultBlocktime: number
  @Field({ nullable: true })
  extendBlocktime: number
  @Field({ nullable: true })
  remainingDays: number
  @Field({ nullable: true })
  orderBook: string
  @Field({ nullable: true })
  loan: string
  @Field({ nullable: true })
  newLoan: string
  @Field({ nullable: true })
  amountOffered: number
  @Field({ nullable: true })
  lender: string
  @Field({ nullable: true })
  status: string
  @Field({ nullable: true })
  borrower: string
  @Field({ nullable: true })
  collateralMint: string
  @Field({ nullable: true })
  collectionName: string
  @Field({ nullable: true })
  collectionImage: string
  @Field({ nullable: true })
  helloMoonCollectionId: string
  @Field({ nullable: true })
  tokenMint: string
  @Field({ nullable: true })
  amountTaken: number
  @Field({ nullable: true })
  offerInterest: number
  @Field({ nullable: true })
  borrowInterest: number
  @Field({ nullable: true })
  apy?: number
  @Field({ nullable: true })
  loanDurationSeconds: number
  @Field({ nullable: true })
  amountRepayed: number
  @Field({ nullable: true })
  isRepayEscrow: boolean
  @Field({ nullable: true })
  isDefaultEscrow: boolean
}

@ObjectType()
export class OwnedNft {
  @Field(() => String)
  name: string
  @Field(() => String, { nullable: true })
  image?: string
  @Field(() => String)
  mint: string
  @Field(() => Int, { nullable: true })
  nftListIndex?: number
  @Field(() => String)
  symbol: string
}

@ObjectType()
export class OrderBookList {
  @Field(() => Int)
  id: number
  @Field(() => String)
  pubKey: string
  @Field(() => Number)
  apy: number
  @Field(() => Number, { nullable: true })
  apyAfterFee?: number
  @Field(() => Number, { nullable: true })
  interest?: number
  @Field(() => Number)
  duration: number
  @Field(() => Number)
  feePermillicentage: number
  @Field(() => String, { nullable: true })
  collectionName: string
  @Field(() => String, { nullable: true })
  collectionImage?: string
  @Field(() => Number, { nullable: true })
  floorPrice?: number
  @Field(() => Number, { nullable: true })
  floorPriceSol?: number
  @Field(() => Number, { nullable: true })
  totalPool?: number
  @Field(() => Number, { nullable: true })
  bestOffer?: number
  @Field(() => [OwnedNft], { nullable: true })
  ownedNfts?: OwnedNft[]
}

@ObjectType()
export class PaginatedOrderBookResponse {
  @Field(() => Int)
  count: number
  @Field(() => [OrderBookList])
  data: OrderBookList[]
}

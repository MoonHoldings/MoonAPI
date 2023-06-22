import { InputType, Field } from 'type-graphql'
import { LoanSortType, LoanType, OrderBookSortType, SortOrder } from './enums'

@InputType()
export class LimitOffset {
  @Field({ nullable: true })
  limit?: number
  @Field({ nullable: true })
  offset?: number
}

@InputType()
export class GetLoansFilter {
  @Field({ nullable: true })
  type?: LoanType
  @Field({ nullable: true })
  lenderWallet?: string
  @Field({ nullable: true })
  borrowerWallet?: string
  @Field({ nullable: true })
  orderBookPubKey?: string
  @Field({ nullable: true })
  orderBookId?: number
}

@InputType()
export class LoanSort {
  @Field({ nullable: true })
  type?: LoanSortType
  @Field({ nullable: true })
  order?: SortOrder
}

@InputType()
export class GetLoansArgs {
  @Field({ nullable: true })
  filter?: GetLoansFilter
  @Field({ nullable: true })
  pagination?: LimitOffset
  @Field({ nullable: true })
  sort?: LoanSort
}

@InputType()
export class GetOrderBooksFilter {
  @Field({ nullable: true })
  search?: string
}

@InputType()
export class OrderBookSort {
  @Field({ nullable: true })
  type?: OrderBookSortType
  @Field({ nullable: true })
  order?: SortOrder
}

@InputType()
export class GetOrderBooksArgs {
  @Field({ nullable: true })
  filter?: GetOrderBooksFilter
  @Field({ nullable: true })
  pagination?: LimitOffset
  @Field({ nullable: true })
  sort?: OrderBookSort
  @Field({ nullable: true })
  borrowWalletAddress?: string
  @Field({ nullable: true })
  isBorrowPage?: boolean
}

@InputType()
export class CreateLoan {
  @Field()
  pubKey: string
  @Field()
  version: number
  @Field()
  principalLamports: number
  @Field()
  valueTokenMint: string
  @Field()
  supportsFreezingCollateral: boolean
  @Field()
  isCollateralFrozen: boolean
  @Field()
  isHistorical: boolean
  @Field()
  isForeclosable: boolean
  @Field()
  state: string
  @Field()
  orderBook: string
  @Field({ nullable: true })
  duration?: number
  @Field({ nullable: true })
  lenderWallet?: string
  @Field({ nullable: true })
  offerTime?: number
  @Field({ nullable: true })
  nftCollateralMint?: string
  @Field({ nullable: true })
  lenderNoteMint?: string
  @Field({ nullable: true })
  borrowerNoteMint?: string
  @Field({ nullable: true })
  apy?: number
  @Field({ nullable: true })
  start?: number
  @Field({ nullable: true })
  totalOwedLamports?: number
}

@InputType()
export class BorrowLoan {
  @Field()
  pubKey: string
  @Field()
  nftCollateralMint: string
  @Field()
  lenderNoteMint: string
  @Field()
  borrowerNoteMint: string
  @Field()
  apy: number
  @Field()
  start: number
  @Field()
  totalOwedLamports: number
}

@InputType()
export class CoinData {
  @Field({ nullable: true })
  id: number
  @Field()
  symbol: string
  @Field()
  name: string
  @Field({ nullable: true })
  walletName: string
  @Field({ nullable: true })
  walletAddress: string
  @Field({ nullable: true })
  walletId: number
  @Field({ nullable: true })
  type: string
  @Field()
  holdings: number
}

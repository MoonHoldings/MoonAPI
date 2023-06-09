export enum OrderBookSortType {
  Collection = 'Collection',
  TotalPool = 'Total Pool',
  BestOffer = 'Best Offer',
  Apy = 'APY',
  Duration = 'Duration',
  Interest = 'Interest',
  FloorPrice = 'Floor Price',
}

export enum LoanSortType {
  Time = 'time',
  Amount = 'amount',
}

export enum LoanType {
  Offer = 'offered',
  Taken = 'taken',
}

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export enum HistoricalLoanStatus {
  Repaid = 'Repaid',
  Active = 'Active',
  Foreclosed = 'Foreclosed',
  Canceled = 'Canceled',
  Offered = 'Offered',
  Taken = 'Taken',
}

export enum UserRole {
  Superuser = 'superuser',
}

export enum UserWalletType {
  Manual = 'Manual',
  Auto = 'Auto',
}

export enum TimeRangeType {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
}

export enum PortfolioType {
  NFT = 'Nft',
  CRYPTO = 'Crypto',
  LOAN = 'Loan',
  BORROW = 'Borrow',
}

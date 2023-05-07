export enum OrderBookSortType {
  Collection = 'Collection',
  TotalPool = 'Total Pool',
  BestOffer = 'Best Offer',
  Apy = 'APY',
  Duration = 'Duration',
  Interest = 'Interest',
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

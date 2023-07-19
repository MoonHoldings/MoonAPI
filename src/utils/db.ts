import { DataSource } from 'typeorm'
import { User, NftList, Loan, OrderBook, EmailToken, SignInType, NftMint, Username, AuthToken, Coin, Nft, NftCollection, UserWallet, WalletData, FXRate } from '../entities'

import dotenv from 'dotenv'
dotenv.config()

export const entities = [Loan, OrderBook, NftList, NftMint, User, EmailToken, SignInType, Username, AuthToken, Coin, Nft, NftCollection, UserWallet, WalletData, FXRate]
export const dataSourceConfig: any = {
  type: 'postgres',
  host: process.env.DB_HOST as string,
  database: process.env.DB_NAME as string,
  username: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  port: 5432,
  entities,
  synchronize: true,
  logging: true,
}

export const AppDataSource = new DataSource(dataSourceConfig)

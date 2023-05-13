import { DataSource } from 'typeorm'
import { User, NftList, Loan, OrderBook, EmailToken, SignInType, NftMint, Username, AuthToken, Coin, Nft, NftCollection } from '../entities'

import dotenv from 'dotenv'
dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 5432,
  entities: [Loan, OrderBook, NftList, NftMint, User, EmailToken, SignInType, Username, AuthToken, Coin, Nft, NftCollection],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
})

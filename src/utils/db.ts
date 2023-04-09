import { DataSource } from "typeorm"
import { Loan } from "../entities/Loan"
import { OrderBook } from "../entities/OrderBook"
import { NftList } from "../entities/NftList"

import dotenv from "dotenv"
dotenv.config()

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: 5432,
  entities: [Loan, OrderBook, NftList],
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
})

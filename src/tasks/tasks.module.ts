import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CommandModule } from "nestjs-command"
import { SharkifyService } from "./sharkify.service"
import { SharkifyCommands } from "../commands/sharkify.commands"
import { Loan } from "../entities/Loan"
import { OrderBook } from "../entities/OrderBook"
import { NftList } from "../entities/NftList"

import dotenv from "dotenv"
dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommandModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Loan, OrderBook, NftList],
      synchronize: true,
      logging: ["log", "info", "error", "warn"],
    }),
    TypeOrmModule.forFeature([Loan, OrderBook, NftList]),
  ],
  providers: [SharkifyService, SharkifyCommands],
})
export class TasksModule {}

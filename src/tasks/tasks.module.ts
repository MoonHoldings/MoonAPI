import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandModule } from 'nestjs-command'
import { SharkifyService } from './sharkify.service'
import { DashboardService } from './dashboard.service'
import { NftService } from './nft.service'
import { SharkifyCommands } from '../commands/sharkify.commands'
import { User, NftList, Loan, OrderBook, EmailToken, SignInType, NftMint, Username, AuthToken, Coin, Nft, NftCollection, UserWallet, WalletData, FXRate } from '../entities'

import dotenv from 'dotenv'
dotenv.config()

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommandModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, NftList, Loan, OrderBook, EmailToken, SignInType, NftMint, Username, AuthToken, Coin, Nft, NftCollection, UserWallet, WalletData, FXRate],
      synchronize: true,
      logging: ['log', 'info', 'error', 'warn'],
    }),
    TypeOrmModule.forFeature([User, NftList, Loan, OrderBook, EmailToken, SignInType, NftMint, Username, AuthToken, Coin, Nft, NftCollection, UserWallet, WalletData, FXRate]),
  ],
  providers: [SharkifyService, DashboardService, NftService, SharkifyCommands],
})
export class TasksModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandModule } from 'nestjs-command'
import { SharkifyService } from './sharkify.service'
import { SharkifyCommands } from '../commands/sharkify.commands'
import { SharkifyCommandsService } from './sharkify.commands.service'
import { Loan, OrderBook, NftList, NftMint } from '../entities'

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
      entities: [Loan, OrderBook, NftList, NftMint],
      synchronize: true,
      logging: ['log', 'info', 'error', 'warn'],
    }),
    TypeOrmModule.forFeature([Loan, OrderBook, NftList, NftMint]),
  ],
  providers: [SharkifyService, SharkifyCommandsService, SharkifyCommands],
})
export class TasksModule {}

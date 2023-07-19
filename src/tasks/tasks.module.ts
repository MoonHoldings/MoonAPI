import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandModule } from 'nestjs-command'
import { SharkifyService } from './sharkify.service'
import { NftService } from './nft.service'
import { SharkifyCommands } from '../commands/sharkify.commands'
import { entities, dataSourceConfig } from '../utils/db'

import dotenv from 'dotenv'
dotenv.config()

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommandModule, TypeOrmModule.forRoot(dataSourceConfig), TypeOrmModule.forFeature(entities)],
  providers: [SharkifyService, NftService, SharkifyCommands],
})
export class TasksModule {}

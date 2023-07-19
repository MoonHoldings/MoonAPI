import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommandModule } from 'nestjs-command'
import { NftSchedule } from './nft.schedule'
import { SharkifyCommands } from '../commands/sharkify.commands'
import { entities, dataSourceConfig } from '../utils/db'

import dotenv from 'dotenv'
dotenv.config()

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommandModule, TypeOrmModule.forRoot(dataSourceConfig), TypeOrmModule.forFeature(entities)],
  providers: [NftSchedule, SharkifyCommands],
})
export class TasksModule {}

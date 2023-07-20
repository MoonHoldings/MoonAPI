import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { SharkifyProcessor } from './sharkify.processor'
import { SharkifySchedule } from './sharkify.schedule'
import { entities, dataSourceConfig } from '../../utils/db'
import { TypeOrmModule } from '@nestjs/typeorm'
import { QueueTypes } from '../../types/enums'

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueTypes.Sharkify,
    }),
    BullBoardModule.forFeature({
      name: QueueTypes.Sharkify,
      adapter: BullAdapter,
    }),
    TypeOrmModule.forRoot(dataSourceConfig),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [SharkifySchedule, SharkifyProcessor],
})
export class SharkifyModule {}

import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
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
    TypeOrmModule.forRoot(dataSourceConfig),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [SharkifySchedule, SharkifyProcessor],
})
export class SharkifyModule {}

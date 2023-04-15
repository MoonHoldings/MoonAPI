import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { TasksModule } from "./tasks/tasks.module"
import { BullModule } from '@nestjs/bull';
import 'reflect-metadata';
import { SendMailService } from "./services/Email";

@Module({
  imports: [ScheduleModule.forRoot(), TasksModule, BullModule.registerQueue({
    name: 'sendMail',
  }),],
  providers: [SendMailService]
})
export class AppModule { }

import { OnQueueFailed } from '@nestjs/bull'
import * as Sentry from '@sentry/node'
import { Job } from 'bull'

export abstract class BaseProcessor {
  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    Sentry.captureException(error)
    job.log(`Failed job ${job.id} of type ${job.name}: ${error.message}`)
  }
}

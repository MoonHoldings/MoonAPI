import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { QueueTypes } from '../../types/enums'
import { format } from 'date-fns'
import { saveBorrowDashboardData, saveCryptoDashboardData, saveLoansDashboardData, saveNftDashboardData } from '../../services/Dashboard'
import { BaseProcessor } from '../common/BaseProcessor'

@Processor(QueueTypes.Dashboard)
export class DashboardProcessor extends BaseProcessor {
  private readonly logger = new Logger(DashboardProcessor.name)

  @Process('saveLoansDashboardData')
  async saveLoansDashboardData() {
    this.logger.log(format(new Date(), "'saveLoansDashboardData start:' MMMM d, yyyy h:mma"))
    await saveLoansDashboardData()
    this.logger.log(format(new Date(), "'saveLoansDashboardData end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveBorrowDashboardData')
  async saveBorrowDashboardData() {
    this.logger.log(format(new Date(), "'saveBorrowDashboardData start:' MMMM d, yyyy h:mma"))
    await saveBorrowDashboardData()
    this.logger.log(format(new Date(), "'saveBorrowDashboardData end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveNftDashboardData')
  async saveNftDashboardData() {
    this.logger.log(format(new Date(), "'saveNftDashboardData start:' MMMM d, yyyy h:mma"))
    await saveNftDashboardData()
    this.logger.log(format(new Date(), "'saveNftDashboardData end:' MMMM d, yyyy h:mma"))
  }

  @Process('saveCryptoDashboardData')
  async saveCryptoDashboardData() {
    this.logger.log(format(new Date(), "'saveCryptoDashboardData start:' MMMM d, yyyy h:mma"))
    await saveCryptoDashboardData()
    this.logger.log(format(new Date(), "'saveCryptoDashboardData end:' MMMM d, yyyy h:mma"))
  }
}

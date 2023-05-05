import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DateModule } from '../date/date.module';
import { FacilityLoanTransactionController } from './facility-loan-transaction.controller';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityLoanTransactionController],
  providers: [FacilityLoanTransactionService],
})
export class FacilityLoanTransactionModule {}

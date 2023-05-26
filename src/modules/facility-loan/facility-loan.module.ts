import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { FacilityLoanController } from './facility-loan.controller';
import { FacilityLoanService } from './facility-loan.service';
import { RepaymentScheduleBuilder } from './repayment-schedule.builder';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityLoanController],
  providers: [FacilityLoanService, RepaymentScheduleBuilder],
})
export class FacilityLoanModule {}

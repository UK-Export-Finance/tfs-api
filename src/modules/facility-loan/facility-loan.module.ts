import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { FacilityLoanController } from './facility-loan.controller';
import { FacilityLoanService } from './facility-loan.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityLoanController],
  providers: [FacilityLoanService],
})
export class FacilityLoanModule {}

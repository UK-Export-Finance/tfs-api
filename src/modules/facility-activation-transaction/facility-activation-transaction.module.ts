import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';
import { FacilityModule } from '@ukef/modules/facility/facility.module';
import { FacilityService } from '@ukef/modules/facility/facility.service';

import { FacilityActivationTransactionController } from './facility-activation-transaction.controller';
import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

@Module({
  imports: [AcbsModule, DateModule, FacilityModule],
  controllers: [FacilityActivationTransactionController],
  providers: [FacilityActivationTransactionService, FacilityService],
})
export class FacilityActivationTransactionModule {}

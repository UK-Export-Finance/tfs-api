import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';
import { FacilityModule } from '@ukef/modules/facility/facility.module';

import { FacilityFixedFeeController } from './facility-fixed-fee.controller';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Module({
  imports: [AcbsModule, DateModule, FacilityModule],
  controllers: [FacilityFixedFeeController],
  providers: [FacilityFixedFeeService],
})
export class FacilityFixedFeeModule {}

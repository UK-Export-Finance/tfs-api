import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DateModule } from '../date/date.module';
import { FacilityFixedFeeController } from './facility-fixed-fee.controller';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityFixedFeeController],
  providers: [FacilityFixedFeeService],
})
export class FacilityFixedFeeModule {}

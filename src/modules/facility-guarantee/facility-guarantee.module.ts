import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { FacilityGuaranteeController } from './facility-guarantee.controller';
import { FacilityGuaranteeService } from './facility-guarantee.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityGuaranteeController],
  providers: [FacilityGuaranteeService],
})
export class FacilityGuaranteeModule {}

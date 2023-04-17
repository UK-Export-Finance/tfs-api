import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityController],
  providers: [FacilityService],
})
export class FacilityModule {}

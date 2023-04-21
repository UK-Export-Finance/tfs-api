import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { FacilityModule } from '../facility/facility.module';
import { FacilityService } from '../facility/facility.service';
import { FacilityCovenantController } from './facility-covenant.controller';
import { FacilityCovenantService } from './facility-covenant.service';

@Module({
  imports: [AcbsModule, DateModule, FacilityModule],
  controllers: [FacilityCovenantController],
  providers: [FacilityCovenantService, FacilityService],
})
export class FacilityCovenantModule {}

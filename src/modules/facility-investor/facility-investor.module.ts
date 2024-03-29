import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DateModule } from '../date/date.module';
import { FacilityInvestorController } from './facility-investor.controller';
import { FacilityInvestorService } from './facility-investor.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [FacilityInvestorController],
  providers: [FacilityInvestorService],
})
export class FacilityInvestorModule {}

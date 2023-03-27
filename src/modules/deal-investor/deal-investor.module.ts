import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { DealInvestorController } from './deal-investor.controller';
import { DealInvestorService } from './deal-investor.service';
@Module({
  imports: [AcbsModule, DateModule],
  controllers: [DealInvestorController],
  providers: [DealInvestorService],
})
export class DealInvestorModule {}

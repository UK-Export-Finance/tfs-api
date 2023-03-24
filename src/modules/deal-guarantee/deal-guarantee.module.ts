import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';

import { DealGuaranteeController } from './deal-guarantee.controller';
import { DealGuaranteeService } from './deal-guarantee.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [DealGuaranteeController],
  providers: [DealGuaranteeService],
})
export class DealGuaranteeModule {}

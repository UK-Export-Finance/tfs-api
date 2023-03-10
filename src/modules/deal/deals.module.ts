import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';

@Module({
  imports: [AcbsModule],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}

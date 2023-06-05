import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { DateModule } from '../date/date.module';
import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingService } from './party-external-rating.service';

@Module({
  imports: [AcbsModule, DateModule],
  controllers: [PartyExternalRatingController],
  providers: [PartyExternalRatingService],
  exports: [PartyExternalRatingService],
})
export class PartyExternalRatingModule {}

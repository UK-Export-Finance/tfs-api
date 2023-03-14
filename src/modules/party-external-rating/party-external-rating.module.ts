import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PartyExternalRatingService } from './party-external-rating.service';

@Module({
  imports: [AcbsModule],
  controllers: [PartyExternalRatingController],
  providers: [PartyExternalRatingService],
})
export class PartyExternalRatingModule {}

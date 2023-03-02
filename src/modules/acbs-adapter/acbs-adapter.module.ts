import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { AcbsPartyExternalRatingsProvider } from './acbs-party-external-ratings.provider';

@Module({
  imports: [AcbsModule],
  providers: [AcbsPartyExternalRatingsProvider],
  exports: [AcbsPartyExternalRatingsProvider],
})
export class AcbsAdapterModule {}

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';
import { DealInvestorModule } from '@ukef/modules/deal-investor/deal-investor.module';
import { PartyModule } from '@ukef/modules/party/party.module';
import { PartyExternalRatingModule } from '@ukef/modules/party-external-rating/party-external-rating.module';

import { AcbsExceptionTransformInterceptor } from './acbs-adapter/acbs-exception-transform.interceptor';

@Module({
  imports: [AcbsModule, PartyExternalRatingModule, PartyModule, DealInvestorModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AcbsExceptionTransformInterceptor,
    },
  ],
})
export class TfsModule {}

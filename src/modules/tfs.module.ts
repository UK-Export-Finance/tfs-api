import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { AuthModule } from '@ukef/modules/auth/auth.module';
import { DealGuaranteeModule } from '@ukef/modules/deal-guarantee/deal-guarantee.module';
import { DealInvestorModule } from '@ukef/modules/deal-investor/deal-investor.module';
import { PartyModule } from '@ukef/modules/party/party.module';
import { PartyExternalRatingModule } from '@ukef/modules/party-external-rating/party-external-rating.module';

import { AcbsExceptionTransformInterceptor } from './acbs-adapter/acbs-exception-transform.interceptor';
import { FacilityInvestorModule } from './facility-investor/facility-investor.module';

@Module({
  imports: [AuthModule, AcbsModule, DealGuaranteeModule, DealInvestorModule, FacilityInvestorModule, PartyExternalRatingModule, PartyModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AcbsExceptionTransformInterceptor,
    },
  ],
})
export class TfsModule {}

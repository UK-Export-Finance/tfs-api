import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { AcbsExceptionTransformInterceptor } from '@ukef/modules/acbs-adapter/acbs-exception-transform.interceptor';
import { AuthModule } from '@ukef/modules/auth/auth.module';
import { DealModule } from '@ukef/modules/deal/deal.module';
import { DealGuaranteeModule } from '@ukef/modules/deal-guarantee/deal-guarantee.module';
import { DealInvestorModule } from '@ukef/modules/deal-investor/deal-investor.module';
import { FacilityModule } from '@ukef/modules/facility/facility.module';
import { FacilityActivationTransactionModule } from '@ukef/modules/facility-activation-transaction/facility-activation-transaction.module';
import { FacilityCovenantModule } from '@ukef/modules/facility-covenant/facility-covenant.module';
import { FacilityGuaranteeModule } from '@ukef/modules/facility-guarantee/facility-guarantee.module';
import { FacilityInvestorModule } from '@ukef/modules/facility-investor/facility-investor.module';
import { PartyModule } from '@ukef/modules/party/party.module';
import { PartyExternalRatingModule } from '@ukef/modules/party-external-rating/party-external-rating.module';

@Module({
  imports: [
    AuthModule,
    AcbsModule,
    DealModule,
    DealGuaranteeModule,
    DealInvestorModule,
    FacilityActivationTransactionModule,
    FacilityModule,
    FacilityCovenantModule,
    FacilityGuaranteeModule,
    FacilityInvestorModule,
    PartyExternalRatingModule,
    PartyModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AcbsExceptionTransformInterceptor,
    },
  ],
})
export class TfsModule {}

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';
import { PartyExternalRatingModule } from '@ukef/modules/party-external-rating/party-external-rating.module';

import { AcbsExceptionTransformInterceptor } from './acbs-adapter/acbs-exception-transform.interceptor';
import { DealsModule } from './deal/deals.module';

@Module({
  imports: [AcbsModule, PartyExternalRatingModule, DealsModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AcbsExceptionTransformInterceptor,
    },
  ],
})
export class TfsModule {}

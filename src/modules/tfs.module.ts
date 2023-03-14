import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';
import { AuthModule } from '@ukef/module/auth/auth.module';
import { PartyModule } from '@ukef/module/party/party.module';
import { PartyExternalRatingModule } from '@ukef/module/party-external-rating/party-external-rating.module';

import { AcbsExceptionTransformInterceptor } from './acbs-adapter/acbs-exception-transform.interceptor';

@Module({
  imports: [AuthModule, AcbsModule, PartyExternalRatingModule, PartyModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AcbsExceptionTransformInterceptor,
    },
  ],
  exports: [AuthModule],
})
export class TfsModule {}

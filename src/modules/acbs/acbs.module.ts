import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsAuthenticationModule } from '@ukef/modules/acbs-authentication/acbs-authentication.module';

import { TestController } from './acbs.controller';
import { AcbsDealService } from './acbs-deal.service';
import { AcbsDealGuaranteeService } from './acbs-deal-guarantee.service';
import { AcbsDealPartyService } from './acbs-deal-party.service';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsFacilityPartyService } from './acbs-facility-party.service';
import { AcbsPartyService } from './acbs-party.service';
import { AcbsPartyExternalRatingService } from './acbs-party-external-rating.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        maxRedirects: configService.get<number>('acbs.maxRedirects'),
        timeout: configService.get<number>('acbs.timeout'),
      }),
    }),
    AcbsAuthenticationModule,
  ],
  controllers: [TestController],
  providers: [
    AcbsPartyService,
    AcbsPartyExternalRatingService,
    AcbsDealService,
    AcbsDealGuaranteeService,
    AcbsDealPartyService,
    AcbsFacilityService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityPartyService,
  ],
  exports: [
    AcbsAuthenticationModule,
    AcbsPartyService,
    AcbsPartyExternalRatingService,
    AcbsDealService,
    AcbsDealGuaranteeService,
    AcbsDealPartyService,
    AcbsFacilityService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityPartyService,
  ],
})
export class AcbsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsAuthenticationModule } from '@ukef/modules/acbs-authentication/acbs-authentication.module';
import { HttpModule } from '@ukef/modules/http/http.module';

import { AcbsBundleInformationService } from './acbs-bundleInformation.service';
import { AcbsDealService } from './acbs-deal.service';
import { AcbsDealGuaranteeService } from './acbs-deal-guarantee.service';
import { AcbsDealPartyService } from './acbs-deal-party.service';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsFacilityCovenantService } from './acbs-facility-covenant.service';
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
  providers: [
    AcbsBundleInformationService,
    AcbsPartyService,
    AcbsPartyExternalRatingService,
    AcbsDealService,
    AcbsDealGuaranteeService,
    AcbsDealPartyService,
    AcbsFacilityService,
    AcbsFacilityCovenantService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityPartyService,
  ],
  exports: [
    AcbsAuthenticationModule,
    AcbsBundleInformationService,
    AcbsPartyService,
    AcbsPartyExternalRatingService,
    AcbsDealService,
    AcbsDealGuaranteeService,
    AcbsDealPartyService,
    AcbsFacilityService,
    AcbsFacilityCovenantService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityPartyService,
  ],
})
export class AcbsModule {}

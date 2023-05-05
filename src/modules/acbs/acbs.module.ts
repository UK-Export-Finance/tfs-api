import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsAuthenticationModule } from '@ukef/modules/acbs-authentication/acbs-authentication.module';
import { HttpModule } from '@ukef/modules/http/http.module';

import { AcbsDealService } from './acbs-deal.service';
import { AcbsDealGuaranteeService } from './acbs-deal-guarantee.service';
import { AcbsDealPartyService } from './acbs-deal-party.service';
import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsFacilityCovenantService } from './acbs-facility-covenant.service';
import { AcbsFacilityFixedFeeService } from './acbs-facility-fixed-fee.service';
import { AcbsFacilityGuaranteeService } from './acbs-facility-guarantee.service';
import { AcbsFacilityLoanService } from './acbs-facility-loan.service';
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
    AcbsPartyService,
    AcbsPartyExternalRatingService,
    AcbsDealService,
    AcbsDealGuaranteeService,
    AcbsDealPartyService,
    AcbsFacilityService,
    AcbsFacilityCovenantService,
    AcbsFacilityFixedFeeService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityLoanService,
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
    AcbsFacilityCovenantService,
    AcbsFacilityFixedFeeService,
    AcbsFacilityGuaranteeService,
    AcbsFacilityLoanService,
    AcbsFacilityPartyService,
  ],
})
export class AcbsModule {}

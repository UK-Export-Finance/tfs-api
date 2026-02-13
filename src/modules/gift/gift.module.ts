import { Module } from '@nestjs/common';

import { GiftCurrencyController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import {
  GiftBusinessCalendarsConventionService,
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAmendmentService,
  GiftFacilityAsyncValidationService,
  GiftFacilityService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftHttpService,
  GiftObligationService,
  GiftObligationSubtypeService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftRiskDetailsService,
  GiftStatusService,
  GiftWorkPackageService,
} from './services';

@Module({
  providers: [
    GiftBusinessCalendarService,
    GiftBusinessCalendarsConventionService,
    GiftCounterpartyService,
    GiftCurrencyService,
    GiftFacilityAsyncValidationService,
    GiftFacilityService,
    GiftFacilityAmendmentService,
    GiftFeeTypeService,
    GiftFixedFeeService,
    GiftHttpService,
    GiftObligationService,
    GiftObligationSubtypeService,
    GiftProductTypeService,
    GiftRepaymentProfileService,
    GiftRiskDetailsService,
    GiftStatusService,
    GiftWorkPackageService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}

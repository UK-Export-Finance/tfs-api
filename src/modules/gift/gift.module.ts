import { Module } from '@nestjs/common';

import { GiftCurrencyController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import {
  GiftBusinessCalendarService,
  GiftCounterpartyService,
  GiftCurrencyService,
  GiftFacilityAsyncValidationService,
  GiftFacilityService,
  GiftFeeTypeService,
  GiftFixedFeeService,
  GiftHttpService,
  GiftObligationService,
  GiftObligationSubtypeService,
  GiftProductTypeService,
  GiftRepaymentProfileService,
  GiftStatusService,
} from './services';

@Module({
  providers: [
    GiftBusinessCalendarService,
    GiftCounterpartyService,
    GiftCurrencyService,
    GiftFacilityAsyncValidationService,
    GiftFacilityService,
    GiftFeeTypeService,
    GiftFixedFeeService,
    GiftHttpService,
    GiftObligationService,
    GiftObligationSubtypeService,
    GiftProductTypeService,
    GiftRepaymentProfileService,
    GiftStatusService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}

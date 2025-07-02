import { Module } from '@nestjs/common';

import { GiftCurrencyController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import {
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

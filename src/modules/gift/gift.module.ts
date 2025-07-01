import { Module } from '@nestjs/common';

import { GiftCurrencyController, GiftFacilityController, GiftFeeTypeController } from './controllers';
import { GiftCounterpartyService } from './services/gift.counterparty.service';
import { GiftCurrencyService } from './services/gift.currency.service';
import { GiftFacilityService } from './services/gift.facility.service';
import { GiftFacilityAsyncValidationService } from './services/gift.facility-async-validation.service';
import { GiftFeeTypeService } from './services/gift.fee-type.service';
import { GiftFixedFeeService } from './services/gift.fixed-fee.service';
import { GiftHttpService } from './services/gift.http.service';
import { GiftObligationService } from './services/gift.obligation.service';
import { GiftObligationSubtypeService } from './services/gift.obligation-subtype.service';
import { GiftRepaymentProfileService } from './services/gift.repayment-profile.service';
import { GiftStatusService } from './services/gift.status.service';

@Module({
  providers: [
    GiftCounterpartyService,
    GiftCurrencyService,
    GiftFacilityService,
    GiftFacilityAsyncValidationService,
    GiftFeeTypeService,
    GiftFixedFeeService,
    GiftHttpService,
    GiftObligationService,
    GiftObligationSubtypeService,
    GiftRepaymentProfileService,
    GiftStatusService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}

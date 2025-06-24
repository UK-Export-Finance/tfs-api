import { Module } from '@nestjs/common';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyController } from './gift.currency.controller';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFacilityController } from './gift.facility.controller';
import { GiftFacilityService } from './gift.facility.service';
import { GiftFacilityAsyncValidationService } from './gift.facility-async-validation.service';
import { GiftFeeTypeController } from './gift.fee-type.controller';
import { GiftFeeTypeService } from './gift.fee-type.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftHttpService } from './gift.http.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftStatusService } from './gift.status.service';

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
    GiftRepaymentProfileService,
    GiftStatusService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}

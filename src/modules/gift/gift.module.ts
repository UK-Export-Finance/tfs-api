import { Module } from '@nestjs/common';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyController } from './gift.currency.controller';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFacilityController } from './gift.facility.controller';
import { GiftFeeTypeController } from './gift.fee-type.controller';
import { GiftFeeTypeService } from './gift.fee-type.service';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  providers: [
    GiftHttpService,
    GiftCurrencyService,
    GiftCounterpartyService,
    GiftFixedFeeService,
    GiftFeeTypeService,
    GiftObligationService,
    GiftRepaymentProfileService,
    GiftService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController, GiftFeeTypeController],
})
export class GiftModule {}

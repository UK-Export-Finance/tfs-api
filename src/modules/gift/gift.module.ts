import { Module } from '@nestjs/common';

import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftCurrencyController } from './gift.currency.controller';
import { GiftCurrencyService } from './gift.currency.service';
import { GiftFacilityController } from './gift.facility.controller';
import { GiftFixedFeeService } from './gift.fixed-fee.service';
import { GiftHttpService } from './gift.http.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftStatusService } from './gift.status.service';

@Module({
  providers: [
    GiftHttpService,
    GiftCurrencyService,
    GiftCounterpartyService,
    GiftFixedFeeService,
    GiftObligationService,
    GiftRepaymentProfileService,
    GiftService,
    GiftStatusService,
  ],
  controllers: [GiftCurrencyController, GiftFacilityController],
})
export class GiftModule {}

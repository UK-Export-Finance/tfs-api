import { Module } from '@nestjs/common';

import { GiftController } from './gift.controller';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftObligationService } from './gift.obligation.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  providers: [GiftHttpService, GiftService, GiftCounterpartyService, GiftObligationService, GiftRepaymentProfileService],
  controllers: [GiftController],
})
export class GiftModule {}

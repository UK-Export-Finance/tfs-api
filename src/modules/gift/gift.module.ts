import { Module } from '@nestjs/common';

import { GiftController } from './gift.controller';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftRepaymentProfileService } from './gift.repayment-profile.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  providers: [GiftHttpService, GiftService, GiftCounterpartyService, GiftRepaymentProfileService],
  controllers: [GiftController],
})
export class GiftModule {}

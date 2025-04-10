import { Module } from '@nestjs/common';

import { GiftController } from './gift.controller';
import { GiftCounterpartyService } from './gift.counterparty.service';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  providers: [GiftHttpService, GiftService, GiftCounterpartyService],
  controllers: [GiftController],
})
export class GiftModule {}

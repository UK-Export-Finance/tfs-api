import { Module } from '@nestjs/common';

import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  providers: [GiftHttpService, GiftService],
  controllers: [GiftController],
})
export class GiftModule {}

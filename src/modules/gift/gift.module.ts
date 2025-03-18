import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GiftConfig, KEY as GIFT_CONFIG_KEY } from '@ukef/config/gift.config';

import { HttpModule } from '../http/http.module';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { GiftHttpService } from './gift-http.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { baseUrl, apiKeyHeaderName, apiKeyHeaderValue, maxRedirects, timeout } = configService.get<GiftConfig>(GIFT_CONFIG_KEY);
        return {
          baseURL: baseUrl,
          maxRedirects,
          timeout,
          headers: {
            [apiKeyHeaderName]: apiKeyHeaderValue,
          },
        };
      },
    }),
  ],
  providers: [GiftHttpService, GiftService],
  controllers: [GiftController],
})
export class GiftModule {}

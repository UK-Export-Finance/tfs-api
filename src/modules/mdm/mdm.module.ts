import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KEY as MDM_CONFIG_KEY, MdmConfig } from '@ukef/config/mdm.config';
import { HttpModule } from '@ukef/modules/http/http.module';

import { MdmService } from './mdm.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { baseUrl, apiKeyHeaderName, apiKeyHeaderValue, maxRedirects, timeout } = configService.get<MdmConfig>(MDM_CONFIG_KEY);
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
  providers: [MdmService],
  exports: [MdmService],
})
export class MdmModule {}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AcbsAuthenticationService } from './acbs-authentication.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        maxRedirects: configService.get<number>('acbs.maxRedirects'),
        timeout: configService.get<number>('acbs.timeout'),
      }),
    }),
  ],
  providers: [AcbsAuthenticationService],
})
export class AcbsModule {}

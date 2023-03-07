import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TestController } from './acbs.controller';
import { AcbsAuthenticationService } from './acbs-authentication.service';
import { AcbsPartyExternalRatingService } from './acbs-party-external-rating.service';

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
  controllers: [TestController],
  providers: [AcbsAuthenticationService, AcbsPartyExternalRatingService],
  exports: [AcbsAuthenticationService, AcbsPartyExternalRatingService],
})
export class AcbsModule {}

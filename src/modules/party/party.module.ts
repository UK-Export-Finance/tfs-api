import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { HttpModule } from '@ukef/modules/http/http.module';

import { DateModule } from '../date/date.module';
import { PartyExternalRatingModule } from '../party-external-rating/party-external-rating.module';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';

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
    AcbsModule,
    DateModule,
    PartyExternalRatingModule,
  ],
  controllers: [PartyController],
  providers: [PartyService],
})
export class PartyModule {}

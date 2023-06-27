import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';
import { DateModule } from '@ukef/modules/date/date.module';
import { HttpModule } from '@ukef/modules/http/http.module';
import { MdmModule } from '@ukef/modules/mdm/mdm.module';
import { AssignedRatingCodeProvider } from '@ukef/modules/party/assigned-rating-code.provider';
import { PartyExternalRatingModule } from '@ukef/modules/party-external-rating/party-external-rating.module';

import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { PartyCustomerTypeService } from './party-customer-type.service';

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
    MdmModule,
  ],
  controllers: [PartyController],
  providers: [PartyService, AssignedRatingCodeProvider, PartyCustomerTypeService],
})
export class PartyModule {}

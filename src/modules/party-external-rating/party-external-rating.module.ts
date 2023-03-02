import { DynamicModule, Module } from '@nestjs/common';

import { PartyExternalRatingController } from './party-external-rating.controller';
import { PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL, PartyExternalRatingModuleOptions } from './party-external-rating.module-definition';

@Module({})
export class PartyExternalRatingModule {
  static register({ imports, partyExternalRatingsProviderClass }: PartyExternalRatingModuleOptions): DynamicModule {
    return {
      module: PartyExternalRatingModule,
      imports,
      controllers: [PartyExternalRatingController],
      providers: [
        {
          provide: PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL,
          useClass: partyExternalRatingsProviderClass,
        },
      ],
    };
  }
}

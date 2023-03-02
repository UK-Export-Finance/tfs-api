import { Type } from '@nestjs/common';

import { PartyExternalRatingsProvider } from './party-external-ratings.provider';

export interface PartyExternalRatingModuleOptions {
  imports: Type<any>[];
  partyExternalRatingsProviderClass: Type<PartyExternalRatingsProvider>;
}

export const PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL = Symbol('PARTY_EXTERNAL_RATINGS_PROVIDER');

import { PartyExternalRating } from './party-external-rating.interface';

export interface PartyExternalRatingsProvider {
  getExternalRatingsForParty(partyIdentifier: string): Promise<PartyExternalRating[]>;
}

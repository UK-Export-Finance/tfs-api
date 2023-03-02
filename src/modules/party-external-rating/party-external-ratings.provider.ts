import { PartyExternalRating } from './party-external-rating';

export interface PartyExternalRatingsProvider {
  getExternalRatingsForParty(partyIdentifier: string): Promise<PartyExternalRating[]>;
}

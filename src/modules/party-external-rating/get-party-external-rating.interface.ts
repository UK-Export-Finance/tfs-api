import { DateString } from '@ukef/helpers/date-string.type';

export interface GetPartyExternalRating {
  partyIdentifier: string;
  ratingEntity: {
    ratingEntityCode: string;
  };
  assignedRating: {
    assignedRatingCode: string;
  };
  ratedDate: DateString;
  probabilityofDefault: number;
  lossGivenDefault: number;
  riskWeighting: number;
  externalRatingNote1: string;
  externalRatingNote2: string;
  externalRatingUserCode1: string;
  externalRatingUserCode2: string;
}

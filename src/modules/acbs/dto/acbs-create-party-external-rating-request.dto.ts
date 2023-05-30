import { DateString } from '@ukef/helpers';

export interface AcbsCreatePartyExternalRatingRequestDto {
  PartyIdentifier: string;
  RatingEntity: {
    RatingEntityCode: string;
  };
  AssignedRating: {
    AssignedRatingCode: string;
  };
  RatedDate: DateString;
  ProbabilityofDefault: string;
  LossGivenDefault: string;
  RiskWeighting: string;
  ExternalRatingNote1: string;
  ExternalRatingNote2: string;
}

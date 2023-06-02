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
  ProbabilityofDefault: number;
  LossGivenDefault: number;
  RiskWeighting: number;
  ExternalRatingNote1: string;
  ExternalRatingNote2: string;
}

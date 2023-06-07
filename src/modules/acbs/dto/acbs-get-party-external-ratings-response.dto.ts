import { DateString } from '@ukef/helpers/date-string.type';

export type AcbsGetPartyExternalRatingsResponseDto = AcbsGetPartyExternalRatingsResponseItem[];

interface AcbsGetPartyExternalRatingsResponseItem {
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
  ExternalRatingUserCode1: {
    UserCode1: string;
  };
  ExternalRatingUserCode2: {
    UserCode2: string;
  };
}

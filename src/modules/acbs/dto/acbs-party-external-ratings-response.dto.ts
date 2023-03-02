export type AcbsPartyExternalRatingsResponseDto = AcbsPartyExternalRatingDto[];

interface AcbsPartyExternalRatingDto {
  PartyIdentifier: string;
  RatingEntity: {
    RatingEntityCode: string;
  };
  AssignedRating: {
    AssignedRatingCode: string;
  };
  RatedDate: Date; // TODO APIM-76: axios will actually return a string here, should we transform this with an axios interceptor?
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

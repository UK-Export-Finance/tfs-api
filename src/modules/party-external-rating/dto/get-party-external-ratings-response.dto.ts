import { ApiResponseProperty } from '@nestjs/swagger';

export type GetPartyExternalRatingsResponse = GetPartyExternalRatingsResponseElement[];

class GetPartyExternalRatingResponseRatingEntity {
  @ApiResponseProperty()
  ratingEntityCode: string;
}

class GetPartyExternalRatingResponseAssignedRating {
  @ApiResponseProperty()
  assignedRatingCode: string;
}

export class GetPartyExternalRatingsResponseElement {
  @ApiResponseProperty()
  partyIdentifier: string;

  @ApiResponseProperty()
  ratingEntity: GetPartyExternalRatingResponseRatingEntity;

  @ApiResponseProperty()
  assignedRating: GetPartyExternalRatingResponseAssignedRating;

  @ApiResponseProperty()
  ratedDate: Date;

  @ApiResponseProperty()
  probabilityofDefault: number;

  @ApiResponseProperty()
  lossGivenDefault: number;

  @ApiResponseProperty()
  riskWeighting: number;

  @ApiResponseProperty()
  externalRatingNote1: string;

  @ApiResponseProperty()
  externalRatingNote2: string;

  @ApiResponseProperty()
  externalRatingUserCode1: string;

  @ApiResponseProperty()
  externalRatingUserCode2: string;
}

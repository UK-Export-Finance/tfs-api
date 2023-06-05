import { ApiResponseProperty } from '@nestjs/swagger';
import { DateString } from '@ukef/helpers/date-string.type';

export type GetPartyExternalRatingsResponseDto = GetPartyExternalRatingsResponseItem[];

class GetPartyExternalRatingResponseRatingEntity {
  @ApiResponseProperty()
  ratingEntityCode: string;
}

class GetPartyExternalRatingResponseAssignedRating {
  @ApiResponseProperty()
  assignedRatingCode: string;
}

export class GetPartyExternalRatingsResponseItem {
  @ApiResponseProperty()
  partyIdentifier: string;

  @ApiResponseProperty()
  ratingEntity: GetPartyExternalRatingResponseRatingEntity;

  @ApiResponseProperty()
  assignedRating: GetPartyExternalRatingResponseAssignedRating;

  @ApiResponseProperty({
    type: Date,
  })
  ratedDate: DateString;

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

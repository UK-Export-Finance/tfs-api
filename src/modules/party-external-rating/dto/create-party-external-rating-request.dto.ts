import { ENUMS } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class CreatePartyExternalRatingRequestDto {
  @ValidatedStringApiProperty({
    description: 'A numeric code denoting the rating of the customer.',
    enum: ENUMS.ASSIGNED_RATING_CODES,
  })
  assignedRatingCode: string;

  @ValidatedDateOnlyApiProperty({
    description: 'The date of creation (also known as the officerRiskDate).',
  })
  ratedDate: string;
}

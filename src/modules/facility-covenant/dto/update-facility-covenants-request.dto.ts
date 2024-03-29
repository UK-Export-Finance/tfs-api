import { EXAMPLES } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export class UpdateFacilityCovenantsRequestDto {
  @ValidatedNumberApiProperty({
    description: 'The amount used to determine if the covenant is in compliance or not. It is required if expirationDate is not provided.',
    minimum: 0,
    required: false,
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
  })
  readonly targetAmount?: number;

  @ValidatedDateOnlyApiProperty({
    description: 'The expiration date of the covenant. It is called expiration date in ACBS. It is required if targetAmount is not provided.',
    required: false,
    nullable: false,
  })
  readonly expirationDate?: DateOnlyString;
}

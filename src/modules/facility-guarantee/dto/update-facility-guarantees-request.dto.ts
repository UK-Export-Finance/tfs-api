import { EXAMPLES } from '@ukef/constants';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export class UpdateFacilityGuaranteesRequestDto {
  @ValidatedDateOnlyApiProperty({
    description: 'The date that the guarantee will expire on. It is required if guaranteedLimit is not provided.',
    required: false,
    nullable: false,
  })
  readonly expirationDate?: DateOnlyString;

  @ValidatedNumberApiProperty({
    description: 'The maximum amount the guarantor will guarantee. It is required if expirationDate is not provided.',
    minimum: 0,
    required: false,
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
  })
  readonly guaranteedLimit?: number;
}

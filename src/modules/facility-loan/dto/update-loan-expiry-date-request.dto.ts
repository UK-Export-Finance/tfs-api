import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export class UpdateLoanExpiryDateRequest {
  @ValidatedDateOnlyApiProperty({
    description: 'The date that this amendment is effective.',
  })
  readonly expiryDate: DateOnlyString;
}

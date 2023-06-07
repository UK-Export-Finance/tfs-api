import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export class UpdateLoanExpiryDateRequest {
  @ValidatedDateOnlyApiProperty({
    description: 'The new expiry date of the loan.',
  })
  readonly expiryDate: DateOnlyString;
}

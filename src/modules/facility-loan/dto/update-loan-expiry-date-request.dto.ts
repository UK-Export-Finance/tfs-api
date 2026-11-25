import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { FlexibleValidation } from '@ukef/decorators/flexible-validation.decorator';
import { DateOnlyString } from '@ukef/helpers';

@FlexibleValidation()
export class UpdateLoanExpiryDateRequest {
  @ValidatedDateOnlyApiProperty({
    description: 'The new expiry date of the loan.',
  })
  readonly expiryDate!: DateOnlyString;
}

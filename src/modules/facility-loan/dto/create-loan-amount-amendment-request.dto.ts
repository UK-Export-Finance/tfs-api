import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { DateOnlyString } from '@ukef/helpers';

export type CreateLoanAmountAmendmentRequest = CreateLoanAmountAmendmentRequestItem[];

export class CreateLoanAmountAmendmentRequestItem {
  @ValidatedDateOnlyApiProperty({
    description: 'The date that this amendment is effective.',
  })
  readonly effectiveDate: DateOnlyString;

  @ValidatedNumberApiProperty({
    description:
      'The amount to change the loan amount by. A positive number increases the loan amount, a negative number decreases the loan amount. 0 is not allowed.',
    example: 1000000,
    forbidZero: true,
  })
  readonly amountAmendment: number;
}

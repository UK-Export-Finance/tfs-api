import { ValidatedLoanIdentifierApiProperty } from '@ukef/decorators/validated-loan-identifier-api-property';

export class UpdateLoanExpiryDateResponse {
  @ValidatedLoanIdentifierApiProperty({
    description: 'The identifier of the loan in ACBS.',
  })
  readonly loanIdentifier: string;
}

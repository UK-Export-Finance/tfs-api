import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { ValidatedLoanIdentifierApiProperty } from '@ukef/decorators/validated-loan-identifier-api-property';

export class CreateLoanAmountAmendmentParams {
  @ValidatedLoanIdentifierApiProperty({
    description: 'The identifier of the loan in ACBS.',
  })
  readonly loanIdentifier: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The identifier of the facility in ACBS.',
  })
  readonly facilityIdentifier: string;
}

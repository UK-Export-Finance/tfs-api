import { EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreateFacilityLoanRequestDto = CreateFacilityLoanRequestItem[];

export class CreateFacilityLoanRequestItem {
  @ValidatedStringApiProperty({
    description: 'The identifier of the facility to create the loan for in ACBS.',
    example: EXAMPLES.FACILITY_ID,
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
  })
  readonly facilityIdentifier: string;

  // TODO add request body properties here
}

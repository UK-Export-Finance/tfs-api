import { ENUMS, EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedCurrencyApiProperty } from '@ukef/decorators/validated-currency-api-property-decorator';
import { ValidatedDateOnlyApiProperty } from '@ukef/decorators/validated-date-only-api-property.decorator';
import { ValidatedNumberApiProperty } from '@ukef/decorators/validated-number-api-property.decorator';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { DateOnlyString, UkefId } from '@ukef/helpers';

export type CreateFacilityLoanRequestDto = CreateFacilityLoanRequestItem[];

export class CreateFacilityLoanRequestItem {
  @ValidatedDateOnlyApiProperty({
    description: 'The date of the action.',
    example: '2024-04-19',
  })
  postingDate: DateOnlyString;

  @ValidatedStringApiProperty({
    description: 'The identifier of the facility to create the loan for in ACBS.',
    example: EXAMPLES.FACILITY_ID,
    length: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
  })
  readonly facilityIdentifier: UkefId;

  @ValidatedStringApiProperty({
    description: 'The customer identifier representing the borrower for the loan.',
    example: '00291013',
    length: 8,
  })
  readonly borrowerPartyIdentifier: string;

  @ValidatedStringApiProperty({
    description: `The product type identifier, e.g. '250' for BOND.`,
    example: '250',
    length: 3,
    enum: ENUMS.PRODUCT_TYPE_IDS,
  })
  readonly productTypeId: string;

  @ValidatedStringApiProperty({
    description: `The product group, r.g. 'BS' for BOND.`,
    example: 'BS',
    enum: ENUMS.PRODUCT_TYPE_GROUPS,
  })
  readonly productTypeGroup: string;

  @ValidatedCurrencyApiProperty({
    description: 'The currency code of the primary currency of the loan, from the Currency Definition Table.',
  })
  currency: string;

  @ValidatedNumberApiProperty({
    description: 'The exchange rate between the loan currency and the deal currency. Required when loan currency differs from deal currency.',
    required: false,
  })
  dealCustomerUsageRate: number;

  @ValidatedStringApiProperty({
    description: `Represents the currency exchange rate operand (M-multiply or D-divide). Required when loan currency differs from deal currency.`,
    example: 'M',
    required: false,
  })
  readonly dealCustomerUsageOperationType: string;

  @ValidatedNumberApiProperty({
    description: 'Populated with the amount of the loan.',
    minimum: 0,
  })
  amount: number;

  @ValidatedDateOnlyApiProperty({
    description: 'The facility issue date.',
    example: '2023-04-19',
  })
  issueDate: DateOnlyString;

  @ValidatedDateOnlyApiProperty({
    description: 'The facility expiry date.',
    example: '2024-04-19',
  })
  expiryDate: DateOnlyString;
}

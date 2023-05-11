import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type GetFacilityLoanTransactionResponseDto = GetFacilityLoanTransactionResponseItem[];

export class GetFacilityLoanTransactionResponseItem {
  @ApiProperty({
    description: 'The identifier of the portfolio in ACBS. The UKEF portfolio is E1.',
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.GLOBAL.portfolioIdentifier,
    default: PROPERTIES.GLOBAL.portfolioIdentifier,
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'A numeric code denoting the status of the bundle.',
    minLength: 0,
    maxLength: 2,
    example: EXAMPLES.BUNDLE_STATUS_CODE,
  })
  readonly bundleStatusCode: string;

  @ApiProperty({
    description: 'A description of the status of the bundle corresponding to the bundle status code.',
    minLength: 0,
    maxLength: 20,
    example: EXAMPLES.BUNDLE_STATUS_DESC,
  })
  readonly bundleStatusDesc: string;

  @ApiProperty({
    description: 'The date when the bundle will be posted. It cannot be before the current processing date.',
    example: EXAMPLES.DATE_ONLY_STRING,
    type: Date,
    format: 'date',
  })
  readonly postingDate: DateOnlyString;

  @ApiProperty({
    description: 'The identifier of the facility in ACBS.',
    minLength: 10,
    maxLength: 10,
    example: EXAMPLES.FACILITY_ID,
  })
  readonly facilityIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the loan borrower in ACBS.',
    minLength: 8,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
  })
  readonly borrowerPartyIdentifier: string;

  @ApiProperty({
    description:
      'The product type identifier for the loan: 250 for BSS, 260 for EWCS, 280 for GEF-Cash, 281 for GEF-Contingent. It is called the product type code in ACBS.',
    example: EXAMPLES.PRODUCT_TYPE_ID,
  })
  readonly productTypeId: string;

  @ApiProperty({
    description: 'The product type group identifier for the loan: EW for EWCS, BS for Bond, GM for GEF. It is called the product group code in ACBS.',
    example: EXAMPLES.PRODUCT_TYPE_GROUP,
  })
  readonly productTypeGroup: string;

  @ApiProperty({ description: 'The currency code for the loan.', minLength: 3, maxLength: 3, example: EXAMPLES.CURRENCY })
  readonly currency: string;

  @ApiProperty({
    description:
      'The exchange rate between the loan currency and the deal currency. It is only applicable when the loan currency differs from the facility currency.',
    example: EXAMPLES.DEAL_CUSTOMER_USAGE_RATE,
  })
  readonly dealCustomerUsageRate: number | null;

  @ApiProperty({
    description:
      'This represents the operand (M for multiply or D for divide) used to convert the amounts. It is only applicable when the loan currency differs from the facility currency.',
    minLength: 0,
    maxLength: 1,
    example: EXAMPLES.DEAL_CUSTOMER_USAGE_RATE,
  })
  readonly dealCustomerUsageOperationType: string | null;

  @ApiProperty({
    description: 'The amount of the loan. It is called loan amount in ACBS.',
    example: EXAMPLES.LOAN_AMOUNT,
  })
  readonly amount: number;

  @ApiProperty({
    description: 'The issue date for the loan. It is called the effective date in ACBS.',
    example: EXAMPLES.DATE_ONLY_STRING,
    type: Date,
    format: 'date',
  })
  readonly issueDate: DateOnlyString;

  @ApiProperty({
    description: 'The expiry date for the loan. It is called the maturity date in ACBS.',
    example: EXAMPLES.DATE_ONLY_STRING,
    type: Date,
    format: 'date',
  })
  readonly expiryDate: DateOnlyString;

  @ApiProperty({
    description:
      'The spread rate of the PAC accrual schedule to factor into the all-in rate if a rate calculation method is selected that includes the spread rate in the calculation.',
    example: EXAMPLES.SPREAD_RATE,
  })
  readonly spreadRate: number;

  @ApiProperty({
    description:
      'The spread rate of the CTL accrual schedule to factor into the all-in rate if a rate calculation method is selected that includes the spread rate in the calculation.',
    example: EXAMPLES.SPREAD_RATE,
    required: false,
  })
  readonly spreadRateCTL: number;

  @ApiProperty({
    description: 'A code denoting the year basis for the accrual schedule.',
    minLength: 0,
    maxLength: 1,
    example: EXAMPLES.YEAR_BASIS,
  })
  readonly yearBasis: string;

  @ApiProperty({
    description: 'The date the next payment will be due for the loan repayment schedule.',
    example: EXAMPLES.DATE_ONLY_STRING,
    type: Date,
    format: 'date',
  })
  readonly nextDueDate: DateOnlyString;

  @ApiProperty({
    description: `A code denoting the index rate change frequency, which is used by ACBS to determine the frequency at which the rate should change when the change timing is set to 'On Anniversary'.`,
    minLength: 0,
    maxLength: 1,
  })
  readonly indexRateChangeFrequency: string;

  @ApiProperty({
    description: `A code denoting the loan billing frequency type, which is used by ACBS to determine the frequency at which the bills should be generated.`,
    minLength: 0,
    maxLength: 1,
    example: EXAMPLES.LOAN_BILLING_FREQUENCY_TYPE,
  })
  readonly loanBillingFrequencyType: string;
}

// TODO: update loan dto
// TODO: raise ticket for validating facilityId for this endpoint

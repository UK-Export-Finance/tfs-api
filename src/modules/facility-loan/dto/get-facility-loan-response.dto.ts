import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';

export type GetFacilityLoanResponseDto = GetFacilityLoanResponseItem[];

export class GetFacilityLoanResponseItem {
  @ApiProperty({
    description: 'The identifier of the portfolio in ACBS. The UKEF portfolio is E1.',
    minLength: 0,
    maxLength: 2,
    example: PROPERTIES.GLOBAL.portfolioIdentifier,
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the loan in ACBS.',
    minLength: 9,
    maxLength: 9,
    example: EXAMPLES.LOAN_ID,
  })
  readonly loanIdentifier: string;

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
    description: 'The issue date for the loan. It is called the effective date in ACBS.',
    type: Date,
    format: 'date',
  })
  readonly issueDate: DateOnlyString;

  @ApiProperty({
    description: 'The expiry date for the loan. It is called the maturity date in ACBS.',
    type: Date,
    format: 'date',
  })
  readonly expiryDate: DateOnlyString;

  @ApiProperty({
    description: 'The loan amount used during loan creation. This value goes down after each fee and may be affected by other factors.',
  })
  readonly principalBalance: number;

  @ApiProperty({})
  readonly interestBalance: number;

  @ApiProperty({})
  readonly feeBalance: number;

  @ApiProperty({})
  readonly otherBalance: number;

  @ApiProperty({})
  readonly discountedPrincipal: number;
}

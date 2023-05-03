import { ApiProperty } from '@nestjs/swagger';
import { DateOnlyString } from '@ukef/helpers';

export type GetFacilityLoanResponseDto = GetFacilityLoanResponseItem[];

export class GetFacilityLoanResponseItem {
  @ApiProperty({
    description: 'The identifier of the portfolio in ACBS. The UKEF portfolio is E1. The maximum number of characters allowed is 2.',
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({ description: 'The identifier of the loan in ACBS. This will be a 9-digit code.' })
  readonly loanIdentifier: string;

  @ApiProperty({ description: 'The identifier of the facility in ACBS. This will be a 10-digit code.' })
  readonly facilityIdentifier: string;

  @ApiProperty({ description: 'The identifier of the loan borrower in ACBS. This will be a 8-digit code.' })
  readonly borrowerPartyIdentifier: string;

  @ApiProperty({
    description:
      'The product type identifier: 250 for BSS, 260 for EWCS, 280 for GEF-Cash, 281 for GEF-Contingent. It is called the product type code in ACBS.',
  })
  readonly productTypeId: string;

  @ApiProperty({ description: 'The product type group identifier: EW for EWCS, BS for Bond, GM for GEF. It is called the product group code in ACBS.' })
  readonly productTypeGroup: string;

  @ApiProperty({ description: 'The 3-character currency code for the loan.' })
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

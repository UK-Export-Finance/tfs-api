import { ApiProperty } from '@nestjs/swagger';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export class GetFacilityCovenantsResponseDto {
  @ApiProperty({
    description:
      'The identifier of the covenant in ACBS. When creating a covenant an identifier from the number generator (exposed via the /numbers endpoint) should be used (if this value is skipped it will be auto-generated by ACBS without checking if it is already used).',
  })
  readonly covenantIdentifier: string;

  @ApiProperty({
    description:
      'The covenant type code: 43 for a UK Contract Value covenant, 46 for a Chargable Amount covenant, and 47 for a chargable Amount covenant not in GBP.',
  })
  readonly covenantType: string;

  @ApiProperty({ description: 'The identifier of the facility in ACBS. This will be a 10-digit code.' })
  readonly facilityIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the portfolio in ACBS. The UKEF portfolio is E1. The maximum number of characters allowed is 2.',
  })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'The target amount used to determine if the covenant is in compliance or not. It is called target amount in ACBS.',
  })
  readonly maximumLiability: number;

  @ApiProperty({
    description: 'The covenant currency type code. The maximum number of characters allowed is 3. It is called pledge type code in ACBS.',
  })
  readonly currency: string;

  @ApiProperty({
    description: 'The effective date of the covenant. It is called effective date in ACBS. Note that guaranteeCommencementDate and effectiveDate are the same.',
    type: Date,
    format: 'date',
  })
  readonly guaranteeCommencementDate: DateOnlyString;

  @ApiProperty({
    description: 'The effective date of the covenant. It is called effective date in ACBS. Note that guaranteeCommencementDate and effectiveDate are the same.',
    type: Date,
    format: 'date',
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: 'The expiration date of the covenant. It is called expiration date in ACBS.',
    type: Date,
    format: 'date',
  })
  readonly guaranteeExpiryDate: DateOnlyString;
}
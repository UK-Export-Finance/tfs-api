import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers';

export type GetFacilityGuaranteesResponse = GetFacilityGuaranteesResponseItem[];

export class GetFacilityGuaranteesResponseItem {
  @ApiProperty({
    description: 'The identifier of the facility.',
    example: EXAMPLES.FACILITY_ID,
  })
  facilityIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the portfolio.',
    example: PROPERTIES.GLOBAL.portfolioIdentifier,
  })
  portfolioIdentifier: string;

  @ApiProperty({
    description: 'The date that this guarantee will take effect.',
    type: Date,
    format: 'date',
  })
  guaranteeCommencementDate: DateOnlyString;

  @ApiProperty({
    description: 'The date that this guarantee will take effect. This is always equal to the guaranteeCommencementDate.',
    type: Date,
    format: 'date',
  })
  effectiveDate: DateOnlyString;

  @ApiProperty({
    description: 'The ACBS party identifier of the guarantor, the customer who is making the guarantee/obligation.',
    example: EXAMPLES.PARTY_ID,
  })
  guarantorParty: string;

  @ApiProperty({
    description: 'An ACBS party identifier.',
    example: EXAMPLES.PARTY_ID,
  })
  limitKey: string;

  @ApiProperty({
    description: 'The date the guarantee for this customer will expire.',
    type: Date,
    format: 'date',
  })
  guaranteeExpiryDate: DateOnlyString;

  @ApiProperty({
    description: 'The maximum amount the guarantor will guarantee.',
  })
  maximumLiability: number;

  @ApiProperty({
    description: 'The identifier for the type of the guarantee.',
    example: '315',
  })
  guaranteeTypeCode: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type GetDealGuaranteeResponse = GetDealGuaranteeResponseItem[];

export class GetDealGuaranteeResponseItem {
  @ApiProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier })
  portfolioIdentifier: string;

  @ApiProperty({ example: EXAMPLES.DEAL_ID })
  dealIdentifier: string;

  @ApiProperty({
    description: `The date that this guarantee will take effect.`,
    type: Date,
    format: 'date',
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: 'The customer identifier of the Guarantor; the Customer who is making the guarantee/obligation. This field cannot be updated',
    minLength: 8,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
  })
  readonly guarantorParty?: AcbsPartyId;

  @ApiProperty({
    description: 'An ACBS party identifier.',
    minLength: 8,
    maxLength: 8,
    example: EXAMPLES.PARTY_ID,
  })
  readonly limitKey: AcbsPartyId;

  @ApiProperty({
    description: 'The date that this guarantee will expire on.',
    type: Date,
    format: 'date',
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ApiProperty({
    description: 'The maximum amount the guarantor will guarantee.',
    minimum: 0,
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
  })
  readonly maximumLiability: number;

  @ApiProperty({
    description: 'Identifies the type of guarantee provided. The value passed for this parameter is validated against the key values in T1080.',
    minLength: 1,
    example: '450',
  })
  readonly guaranteeTypeCode?: string;
}

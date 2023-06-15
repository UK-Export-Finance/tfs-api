import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type GetFacilityInvestorsResponse = GetFacilityInvestorResponseItem[];

export class GetFacilityInvestorResponseItem {
  @ApiProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier, description: 'The identifier of the portfolio.' })
  readonly portfolioIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the facility the investor belongs to.',
    example: EXAMPLES.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  readonly facilityIdentifier: UkefId;

  @ApiProperty({
    description: `The date from which this limit is effective.`,
    type: Date,
    format: 'date',
  })
  readonly effectiveDate: DateOnlyString;

  // TODO APIM-118: this is copy of effective date, we could remove it.
  @ApiProperty({
    description: `The date on which this limit will start.`,
    type: Date,
    format: 'date',
  })
  readonly guaranteeCommencementDate: DateOnlyString;

  @ApiProperty({
    description: `The date on which this limit will expire.`,
    type: Date,
    format: 'date',
  })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ApiProperty({
    description: 'The code of the currency for this investor, Currency in the Currency Definition Table.',
    example: EXAMPLES.CURRENCY,
    minLength: 3,
    maxLength: 3,
  })
  readonly currency: string;

  @ApiProperty({
    description: `The investor's share of the current limit amount.`,
    minimum: 0,
    example: EXAMPLES.DEAL_OR_FACILITY_VALUE,
  })
  readonly maximumLiability: number;

  @ApiProperty({
    description: `Investor record type.`,
    minLength: 3,
    maxLength: 3,
    example: EXAMPLES.LENDER_TYPE_CODE,
  })
  readonly lenderTypeCode: string;

  @ApiProperty({
    description: `ACBS id of involved party.`,
    minLength: 10,
    maxLength: 10,
    example: EXAMPLES.PARTY_ID,
  })
  readonly involvedParty: string;
}

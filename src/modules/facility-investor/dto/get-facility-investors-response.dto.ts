import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES, PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';

export type GetFacilityInvestorsResponse = GetFacilityInvestorResponseItem[];

export class GetFacilityInvestorResponseItem {
  @ApiResponseProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier })
  portfolioIdentifier: string;

  @ApiProperty({
    description: 'The identifier of the facility the investor belongs to.',
    example: EXAMPLES.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  readonly facilityIdentifier: UkefId;

  @ApiProperty({
    description: `The date from which this limit is effective.`,
    example: EXAMPLES.START_DATE,
  })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: `The date on which this limit will start.`,
    example: EXAMPLES.START_DATE,
  })
  readonly guaranteeCommencementDate: DateOnlyString;

  @ApiProperty({
    description: `The date on which this limit will expire.`,
    example: EXAMPLES.END_DATE,
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
    example: '500',
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

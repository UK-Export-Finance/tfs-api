import { ApiProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';
import { IsEnum, IsISO8601, IsNotEmpty, Length, Matches, MaxLength, Min, MinLength } from 'class-validator';

export type GetDealGuaranteeResponse = GetDealGuaranteeResponseItem[];

export class GetDealGuaranteeResponseItem {
  @ApiProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier })
  @IsEnum(ENUMS.PORTFOLIO)
  portfolioIdentifier: string;

  @ApiProperty({ example: EXAMPLES.DEAL_ID })
  dealIdentifier: string;

  @ApiProperty({
    description: `The date that this guarantee will take effect.`,
    type: Date,
    format: 'date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsISO8601({ strict: true })
  readonly effectiveDate: DateOnlyString;

  @ApiProperty({
    description: `UK GOODS (${PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty})`,
    minLength: 8,
    maxLength: 8,
    default: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty,
    required: false,
  })
  @Length(8)
  readonly guarantorParty?: AcbsPartyId;

  @ApiProperty({
    description: 'An ACBS party identifier.',
    minLength: 8,
    maxLength: 8,
    example: '00000002',
  })
  @Length(8)
  readonly limitKey: AcbsPartyId;

  @ApiProperty({
    description: 'The date that this guarantee will expire on.',
    type: Date,
    format: 'date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsISO8601({ strict: true })
  readonly guaranteeExpiryDate: DateOnlyString;

  @ApiProperty({
    description: 'The maximum amount the guarantor will guarantee.',
    minimum: 0,
  })
  @IsNotEmpty()
  @Min(0)
  readonly maximumLiability: number;

  @ApiProperty({
    description: `GOODS (${PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode})`,
    default: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode,
    required: false,
    minLength: 1,
  })
  @MinLength(1)
  @MaxLength(3)
  readonly guaranteeTypeCode?: string;
}

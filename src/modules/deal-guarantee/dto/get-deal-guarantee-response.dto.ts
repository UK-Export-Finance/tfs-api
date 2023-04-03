import { ApiProperty } from '@nestjs/swagger';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyId } from '@ukef/helpers';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';
import { IsISO8601, IsNotEmpty, IsOptional, Length, Matches, Min, MinLength } from 'class-validator';

export type GetDealGuaranteeResponse = GetDealGuaranteeResponseItem[];

export class GetDealGuaranteeResponseItem {
  // @ApiProperty({
  //   description: 'The identifier of the deal to create the guarantee for.',
  //   example: '00000001',
  //   minLength: 1,
  //   maxLength: 10,
  // })
  // @Length(1, 10)
  // TODO APIM-73: Should we remove dealIdentifier from the request body?
  // readonly dealIdentifier: UkefId;

  // TODO APIM-73: Is it okay that I have removed portfolioIdentifier from the request body?

  @ApiProperty({
    description: `The date that this guarantee will take effect. This will be replaced by today's date if a date in the past is provided.`,
    type: Date,
    format: 'date',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsISO8601({ strict: true })
  readonly effectiveDate: DateOnlyString;

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
    description: `UK GOODS (${PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty})`, // TODO APIM-73: can we improve this at all?
    minLength: 1,
    maxLength: 10,
    default: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty,
    required: false,
  })
  @IsOptional()
  @Length(8)
  // TODO APIM-73: ACBS says max length is actually 8 - which is correct?
  readonly guarantorParty?: AcbsPartyId;

  @ApiProperty({
    description: `GOODS (${PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode})`, // TODO APIM-73: Can we improve this at all?
    default: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode,
    required: false,
    minLength: 1,
  })
  @IsOptional()
  @MinLength(1)
  // TODO APIM-73: ACBS says max length is actually 3 - should we add this?
  readonly guaranteeTypeCode?: string;
}

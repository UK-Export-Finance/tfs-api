import { ApiProperty } from '@nestjs/swagger';
import { PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';
import { IsISO8601, IsNotEmpty, IsOptional, Length, Matches, Min, MinLength } from 'class-validator';

export type CreateDealGuaranteeRequest = CreateDealGuaranteeRequestItem[];

export class CreateDealGuaranteeRequestItem {
  @ApiProperty({
    description: 'The identifier of the deal to create the guarantee for.',
    example: '00000001',
    minLength: 1,
    maxLength: 10,
  })
  @Length(1, 10)
  // TODO APIM-73: Should we remove dealIdentifier from the request body?
  readonly dealIdentifier: string;

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
    minLength: 1,
    maxLength: 10,
    example: '00000002',
  })
  @Length(1, 10)
  // TODO APIM-73: ACBS says it can be at most 8 - which is correct?
  readonly limitKey: string;

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
  // TODO APIM-73: ACBS says the maximum is 1E+17 - should we validate this?
  readonly maximumLiability: number;

  @ApiProperty({
    description: `UK GOODS (${PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty})`, // TODO APIM-73: can we improve this at all?
    minLength: 1,
    maxLength: 10,
    default: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty,
    required: false,
  })
  @IsOptional()
  @Length(1, 10)
  // TODO APIM-73: ACBS says max length is actually 8 - which is correct?
  readonly guarantorParty?: string;

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

  constructor(
    dealIdentifier: string,
    effectiveDate: DateOnlyString,
    limitKey: string,
    guaranteeExpiryDate: DateOnlyString,
    maximumLiability: number,
    guarantorParty?: string,
    guaranteeTypeCode?: string,
  ) {
    this.dealIdentifier = dealIdentifier;
    this.effectiveDate = effectiveDate;
    this.limitKey = limitKey;
    this.guaranteeExpiryDate = guaranteeExpiryDate;
    this.maximumLiability = maximumLiability;
    this.guarantorParty = guarantorParty;
    this.guaranteeTypeCode = guaranteeTypeCode;
  }
}

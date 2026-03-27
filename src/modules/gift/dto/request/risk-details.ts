import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsDefined, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

const {
  GIFT: { RISK_DETAILS: EXAMPLE },
} = EXAMPLES;

const {
  FACILITY_CATEGORIES,
  VALIDATION: { RISK_DETAILS: VALIDATION },
} = GIFT;

/**
 * GIFT "risk details" request DTO.
 * These fields are required for APIM to create a "risk details" in GIFT.
 */
export class GiftFacilityRiskDetailsRequestDto {
  @IsDefined()
  @IsNumberString()
  @Length(VALIDATION.ACCOUNT.MIN_LENGTH, VALIDATION.ACCOUNT.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.account,
    description: 'The account number',
    required: true,
  })
  account: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The deal ID',
  })
  @ApiProperty({
    example: EXAMPLE.dealId,
    minLength: VALIDATION.DEAL_ID.MIN_LENGTH,
    maxLength: VALIDATION.DEAL_ID.MAX_LENGTH,
    required: true,
  })
  dealId: UkefId;

  @IsOptional()
  @IsString()
  @Length(VALIDATION.FACILITY_CATEGORY_CODE.MIN_LENGTH, VALIDATION.FACILITY_CATEGORY_CODE.MAX_LENGTH)
  @ApiProperty({
    example: FACILITY_CATEGORIES.BOND_STAND_ALONE,
    minLength: VALIDATION.FACILITY_CATEGORY_CODE.MIN_LENGTH,
    maxLength: VALIDATION.FACILITY_CATEGORY_CODE.MAX_LENGTH,
    description: "Optional facility category code. Required if the product's configuration (APIM MDM/DOM) 'facilityCategoryTypes' field is populated",
    required: false,
  })
  facilityCategoryCode?: string;

  @IsOptional()
  @IsString()
  @Length(VALIDATION.FACILITY_CREDIT_RATING.MIN_LENGTH, VALIDATION.FACILITY_CREDIT_RATING.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.facilityCreditRating,
    description: "The facility's credit rating",
    required: false,
  })
  facilityCreditRating?: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.RISK_STATUS.MIN_LENGTH, VALIDATION.RISK_STATUS.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.riskStatus,
    description: "The facility's risk status",
    required: true,
  })
  riskStatus: string;

  @IsDefined()
  @IsNumberString()
  @Length(VALIDATION.UKEF_INDUSTRY_CODE.MIN_LENGTH, VALIDATION.UKEF_INDUSTRY_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.ukefIndustryCode,
    description: 'The UKEF industry code',
    required: true,
  })
  ukefIndustryCode: string;
}

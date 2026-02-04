import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsDefined, IsNumber, IsNumberString, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { RISK_DETAILS: EXAMPLE },
} = EXAMPLES;

const {
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
    minLength: VALIDATION.ACCOUNT.MIN_LENGTH,
    maxLength: VALIDATION.ACCOUNT.MAX_LENGTH,
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

  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY_CATEGORY.MIN_LENGTH, VALIDATION.FACILITY_CATEGORY.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.facilityCategory,
    minLength: VALIDATION.FACILITY_CATEGORY.MIN_LENGTH,
    maxLength: VALIDATION.FACILITY_CATEGORY.MAX_LENGTH,
    required: true,
  })
  facilityCategory: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.FACILITY_CREDIT_RATING_ID.MIN)
  @Max(VALIDATION.FACILITY_CREDIT_RATING_ID.MAX)
  @ApiProperty({
    example: EXAMPLE.facilityCreditRatingId,
    required: true,
  })
  facilityCreditRatingId: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.RISK_STATUS.MIN_LENGTH, VALIDATION.RISK_STATUS.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.riskStatus,
    required: true,
  })
  riskStatus: string;

  @IsDefined()
  @IsNumberString()
  @Length(VALIDATION.UKEF_INDUSTRY_CODE.MIN_LENGTH, VALIDATION.UKEF_INDUSTRY_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.ukefIndustryCode,
  })
  ukefIndustryCode: string;
}

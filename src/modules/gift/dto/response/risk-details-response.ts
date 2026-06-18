import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { IsNumberString, IsString } from 'class-validator';

const {
  GIFT: { RISK_DETAILS: EXAMPLE },
} = EXAMPLES;

const { FACILITY_CATEGORIES, INTEGRATION_DEFAULTS } = GIFT;

/**
 * GIFT "risk details" response DTO.
 * Returned in a response when creating a "risk details" in GIFT.
 */
export class GiftFacilityRiskDetailsResponseDto {
  @IsNumberString()
  @ApiProperty({
    example: EXAMPLE.account,
  })
  readonly account: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.dealId,
  })
  readonly dealId: UkefId;

  @IsString()
  @ApiProperty({
    example: FACILITY_CATEGORIES.BOND_STAND_ALONE,
  })
  readonly facilityCategoryCode: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.facilityCreditRating,
  })
  readonly facilityCreditRating: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.riskStatus,
  })
  readonly riskStatus: string;

  @IsNumberString()
  @ApiProperty({
    example: EXAMPLE.ukefIndustryCode,
  })
  readonly ukefIndustryCode: string;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.OVERRIDE_RISK_RATING,
  })
  readonly overrideRiskRating: string | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.OVERRIDE_LOSS_GIVEN_DEFAULT,
  })
  readonly overrideLossGivenDefault: boolean | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.RISK_REASSESSMENT_DATE,
  })
  readonly riskReassessmentDate: string | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.RISK_MARKET_CODE,
  })
  readonly riskMarketCode: string;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.PROJECT_FINANCE,
  })
  readonly projectFinance: boolean;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.LINKED_FACILITY_ID,
  })
  readonly linkedFacilityId: string | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.ORIGINAL_FACILITY_EFFECTIVE_DATE,
  })
  readonly originalFacilityEffectiveDate: string | null;
}

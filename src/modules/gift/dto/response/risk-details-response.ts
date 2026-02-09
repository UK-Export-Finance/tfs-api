import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { IsNumber, IsNumberString, IsString } from 'class-validator';

const {
  GIFT: { RISK_DETAILS: EXAMPLE },
} = EXAMPLES;

const { INTEGRATION_DEFAULTS } = GIFT;

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
    example: EXAMPLE.facilityCategory,
  })
  readonly facilityCategory: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.facilityCreditRatingId,
  })
  readonly facilityCreditRatingId: number;

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
    example: INTEGRATION_DEFAULTS.OVERRIDE_RISK_RATING_ID,
  })
  readonly overrideRiskRatingId: string | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.OVERRIDE_LOSS_GIVEN_DEFAULT,
  })
  readonly overrideLossGivenDefault: boolean | null;

  @ApiProperty({
    example: INTEGRATION_DEFAULTS.RISK_REASSESSMENT_DATE,
  })
  readonly riskReassessmentDate: string | null;
}

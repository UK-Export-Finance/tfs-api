import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

import type {
  GiftFacilityCreationGenericRequestDto,
  GiftBusinessCalendarResponseDto,
  GiftBusinessCalendarsConventionResponseDto,
  GiftObligationResponseDto,
  GiftFacilityRiskDetailsResponseDto,
} from '@ukef/modules/gift/dto';

/**
 * GIFT facility creation response DTO.
 * This is what APIM returns after successfully creating a facility in GIFT.
 */
export class GiftFacilityCreationResponseDto extends OmitType(GiftFacilityCreationGenericRequestDto, ['obligations'] as const) {
  @IsString()
  @ApiProperty({
    example: EXAMPLES.GIFT.STATES.APPROVED,
  })
  readonly state: string;

  @ApiProperty({
    example: EXAMPLES.GIFT.BUSINESS_CALENDAR,
    isArray: true,
  })
  readonly businessCalendars: GiftBusinessCalendarResponseDto[];

  @ApiProperty({
    example: EXAMPLES.GIFT.BUSINESS_CALENDARS_CONVENTION,
  })
  readonly businessCalendarsConvention: GiftBusinessCalendarsConventionResponseDto;

  @ApiProperty({
    example: EXAMPLES.GIFT.RISK_DETAILS,
  })
  readonly riskDetails: GiftFacilityRiskDetailsResponseDto;

  @ApiProperty({
    isArray: true,
    type: GiftObligationResponseDto,
  })
  readonly obligations: GiftObligationResponseDto[];
}

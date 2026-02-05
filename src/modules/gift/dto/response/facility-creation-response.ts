import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsString } from 'class-validator';

import { GiftFacilityCreationGenericRequestDto } from '../request/facility-creation-generic';
import { GiftBusinessCalendarResponseDto } from './business-calendar-response';
import { GiftBusinessCalendarsConventionResponseDto } from './business-calendars-convention-response';
import { GiftFacilityRiskDetailsResponseDto } from './risk-details-response';

/**
 * GIFT facility creation response DTO.
 * This is what APIM returns after successfully creating a facility in GIFT.
 */
export class GiftFacilityCreationResponseDto extends GiftFacilityCreationGenericRequestDto {
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
}

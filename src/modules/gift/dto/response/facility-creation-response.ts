import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsString } from 'class-validator';

import { GiftFacilityCreationRequestDto } from '../request/facility-creation';
import { GiftBusinessCalendarResponseDto } from './business-calendar-response';
import { GiftBusinessCalendarsConventionResponseDto } from './business-calendars-convention-response';

/**
 * GIFT facility creation response DTO.
 * This is what APIM returns after successfully creating a facility in GIFT.
 */
export class GiftFacilityCreationResponseDto extends GiftFacilityCreationRequestDto {
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
}

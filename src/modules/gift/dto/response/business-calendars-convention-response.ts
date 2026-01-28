import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsString } from 'class-validator';

const {
  GIFT: { BUSINESS_CALENDARS_CONVENTION },
} = EXAMPLES;

/**
 * GIFT "business calendars convention" response DTO.
 * These fields are:
 * - Defaulted in the request.
 * - Returned when a response when creating a "business calendars convention" in GIFT.
 */
export class GiftBusinessCalendarsConventionResponseDto {
  @IsString()
  @ApiProperty({
    example: BUSINESS_CALENDARS_CONVENTION.businessDayConvention,
  })
  readonly businessDayConvention: string;

  @IsBoolean()
  @ApiProperty({
    example: BUSINESS_CALENDARS_CONVENTION.dueOnLastWorkingDayEachMonth,
  })
  readonly dueOnLastWorkingDayEachMonth: boolean;

  @IsBoolean()
  @ApiProperty({
    example: BUSINESS_CALENDARS_CONVENTION.dateSnapBack,
  })
  readonly dateSnapBack: boolean;
}

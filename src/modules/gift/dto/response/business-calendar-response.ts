import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsDateString, IsString } from 'class-validator';

const {
  GIFT: { BUSINESS_CALENDAR },
} = EXAMPLES;

/**
 * GIFT "business calendar" response DTO.
 * These fields are:
 * - Defaulted in the request.
 * - Returned when a response when creating a "business calendar" in GIFT.
 */
export class GiftBusinessCalendarResponseDto {
  @IsString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.centreCode,
    required: false,
  })
  centreCode: string;

  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.startDate,
    required: true,
  })
  startDate: string;

  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.exitDate,
    required: true,
  })
  exitDate: string;
}

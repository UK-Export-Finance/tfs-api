import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

const {
  GIFT: { BUSINESS_CALENDAR },
} = EXAMPLES;

/**
 * GIFT "business calendar" response DTO.
 * These fields are:
 * - Defaulted in the request.
 * - Returned in a response when creating a "business calendar" in GIFT.
 */
export class GiftBusinessCalendarResponseDto {
  @IsString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.centreCode,
    required: false,
  })
  readonly centreCode!: string;

  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.startDate,
    required: true,
  })
  readonly startDate!: string;

  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.exitDate,
    required: true,
  })
  readonly exitDate!: string;
}

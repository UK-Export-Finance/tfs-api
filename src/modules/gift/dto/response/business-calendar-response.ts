import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsDateString, IsDefined, IsString } from 'class-validator';

const {
  GIFT: { BUSINESS_CALENDAR },
} = EXAMPLES;

/**
 * GIFT "business calendar" response DTO.
 * These fields are required for APIM to create a "business calendar" in GIFT.
 */
export class GiftBusinessCalendarResponseDto {
  @IsDefined()
  @IsString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.centreCode,
    required: false,
  })
  centreCode: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.startDate,
    required: true,
  })
  startDate: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: BUSINESS_CALENDAR.exitDate,
    required: true,
  })
  exitDate: string;
}

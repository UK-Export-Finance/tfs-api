import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsDateString, IsNumber, IsString } from 'class-validator';

const {
  GIFT: { ACCRUAL_SCHEDULE: EXAMPLE, OBLIGATION_ID },
} = EXAMPLES;

/**
 * GIFT "accrual schedule" response DTO.
 * Returned in a response when creating an "accrual schedule" in GIFT.
 */
export class GiftFacilityAccrualScheduleResponseDto {
  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualDayBasisCode,
  })
  readonly accrualDayBasisCode: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualEffectiveDate,
  })
  readonly accrualEffectiveDate: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualFrequencyCode,
  })
  readonly accrualFrequencyCode: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualMaturityDate,
  })
  readonly accrualMaturityDate: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualScheduleTypeCode,
  })
  readonly accrualScheduleTypeCode: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.additionalRate,
  })
  readonly additionalRate: number;

  @IsString()
  readonly additionalRateTypeCode: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.baseRate,
  })
  readonly baseRate: number;

  @IsString()
  readonly baseRateTypeCode: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.firstCycleAccrualEndDate,
  })
  readonly firstCycleAccrualEndDate: string;

  @IsNumber()
  @ApiProperty({
    example: OBLIGATION_ID,
  })
  readonly obligationId: number;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.spreadRate,
  })
  readonly spreadRate: number;
}

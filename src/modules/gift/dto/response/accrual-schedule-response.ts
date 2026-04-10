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
  @IsNumber()
  @ApiProperty({
    // example: EXAMPLE.obligationId,
    example: OBLIGATION_ID,
  })
  readonly obligationId: number;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualScheduleTypeCode,
  })
  readonly accrualScheduleTypeCode: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualEffectiveDate,
  })
  readonly accrualEffectiveDate: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualMaturityDate,
  })
  readonly accrualMaturityDate: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualFrequencyCode,
  })
  readonly accrualFrequencyCode: string;

  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.firstCycleAccrualEndDate,
  })
  readonly firstCycleAccrualEndDate: string;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualDayBasisCode,
  })
  readonly accrualDayBasisCode: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.baseRate,
  })
  readonly baseRate: number;

  @IsString()
  @ApiProperty({
    // example: EXAMPLE.baseRateTypeCode,
  })
  readonly baseRateTypeCode: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.spreadRate,
  })
  readonly spreadRate: number;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.additionalRate,
  })
  readonly additionalRate: number;

  @IsString()
  @ApiProperty({
    // example: EXAMPLE.additionalRateTypeCode,
  })
  readonly additionalRateTypeCode: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsBoolean, IsDateString, IsDefined, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

const {
  GIFT: { ACCRUAL_SCHEDULE: EXAMPLE },
} = EXAMPLES;

const {
  VALIDATION: { ACCRUAL_SCHEDULE: VALIDATION },
} = GIFT;

/**
 * GIFT "accrual schedule" request DTO.
 * These fields are required for APIM to create an "accrual schedule" in GIFT.
 */
export class GiftAccrualScheduleRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.ACCRUAL_DAY_BASIS_CODE.MIN_LENGTH, VALIDATION.ACCRUAL_DAY_BASIS_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.accrualDayBasisCode,
    description: 'The accrual day basis code',
    required: true,
  })
  accrualDayBasisCode: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualEffectiveDate,
    description: 'The effective date (optional)',
    required: false,
  })
  accrualEffectiveDate?: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ACCRUAL_FREQUENCY_CODE.MIN_LENGTH, VALIDATION.ACCRUAL_FREQUENCY_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.accrualFrequencyCode,
    description: 'The accrual frequency code',
    required: true,
  })
  accrualFrequencyCode: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualMaturityDate,
    description: 'The maturity date (optional)',
    required: false,
  })
  accrualMaturityDate?: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ACCRUAL_SCHEDULE_TYPE_CODE.MIN_LENGTH, VALIDATION.ACCRUAL_SCHEDULE_TYPE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.accrualScheduleTypeCode,
    description: 'The accrual schedule type code',
    required: true,
  })
  accrualScheduleTypeCode: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.ADDITIONAL_RATE.MIN)
  @ApiProperty({
    example: EXAMPLE.additionalRate,
    description: 'The additional rate',
    required: true,
  })
  additionalRate: number;

  @IsDefined()
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.baseRate,
    description: 'The base rate',
    required: true,
  })
  baseRate: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    example: true,
    description: 'Whether to enable date snap back (optional)',
    required: false,
  })
  dateSnapBack?: boolean;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.firstCycleAccrualEndDate,
    description: 'The first cycle accrual end date (optional)',
    required: false,
  })
  firstCycleAccrualEndDate?: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.SPREAD_RATE.MIN)
  @ApiProperty({
    example: EXAMPLE.spreadRate,
    description: 'The spread rate',
    required: true,
  })
  spreadRate: number;
}

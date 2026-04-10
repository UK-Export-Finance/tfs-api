import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, IsString } from 'class-validator';

const {
  GIFT: { ACCRUAL_SCHEDULE: EXAMPLE },
} = EXAMPLES;

// const {
//   VALIDATION: { ACCRUAL_SCHEDULE: VALIDATION },
// } = GIFT;

/**
 * GIFT "accrual schedule" request DTO.
 * These fields are required for APIM to create an "accrual schedule" in GIFT.
 */
export class GiftAccrualScheduleRequestDto {
  // @IsDefined()
  // @IsNumber()
  // @ApiProperty({
  //   example: EXAMPLE.obligationId,
  //   description: 'The ID of the obligation',
  //   required: true,
  // })
  // obligationId: number;

  @IsDefined()
  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualScheduleTypeCode,
    description: 'The accrual schedule type code',
    required: true,
  })
  accrualScheduleTypeCode: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualEffectiveDate,
    description: 'The effective date',
    required: true,
  })
  accrualEffectiveDate: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.accrualMaturityDate,
    description: 'The maturity date',
    required: true,
  })
  accrualMaturityDate: string;

  @IsDefined()
  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualFrequencyCode,
    description: 'The accrual frequency code',
    required: true,
  })
  accrualFrequencyCode: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.firstCycleAccrualEndDate,
    description: 'The first cycle accrual end date',
    required: true,
  })
  firstCycleAccrualEndDate: string;

  @IsDefined()
  @IsString()
  @ApiProperty({
    example: EXAMPLE.accrualDayBasisCode,
    description: 'The accrual day basis code',
    required: true,
  })
  accrualDayBasisCode: string;

  @IsDefined()
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.baseRate,
    description: 'The base rate',
    required: true,
  })
  baseRate: number;

  @IsDefined()
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.spreadRate,
    description: 'The spread rate',
    required: true,
  })
  spreadRate: number;

  @IsDefined()
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.additionalRate,
    description: 'The additional rate',
    required: true,
  })
  additionalRate: number;
}

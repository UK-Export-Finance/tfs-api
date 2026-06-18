import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

import { GiftFacilityAccrualScheduleResponseDto } from './accrual-schedule-response';

const {
  GIFT: { ACCRUAL_SCHEDULE, OBLIGATION, OBLIGATION_ID },
} = EXAMPLES;

const {
  INTEGRATION_DEFAULTS: { ACBS_OBLIGATION_ID, LINKED_REPAYMENT_PROFILE_ID },
} = GIFT;

const OBLIGATION_EXAMPLE = OBLIGATION() as {
  amount: number;
  currency: string;
  effectiveDate: string;
  maturityDate: string;
  repaymentType: string;
  subtypeCode: string;
};

/**
 * GIFT obligation response DTO.
 * These fields are returned from GIFT for a facility obligation.
 */
export class GiftObligationResponseDto {
  @IsNumber()
  @ApiProperty({
    example: OBLIGATION_ID,
  })
  readonly id: number;

  @IsDateString()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.effectiveDate,
  })
  readonly effectiveDate: string;

  @IsDateString()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.maturityDate,
  })
  readonly maturityDate: string;

  @IsBoolean()
  @ApiProperty({
    example: false,
  })
  readonly effectiveDateFollowsFacility: boolean;

  @IsBoolean()
  @ApiProperty({
    example: false,
  })
  readonly maturityDateFollowsFacility: boolean;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.currency,
  })
  readonly currency: string;

  @IsNumber()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.amount,
  })
  readonly originalAmount: number;

  @IsNumber()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.amount,
  })
  readonly outstandingAmount: number;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.repaymentType,
  })
  readonly repaymentType: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: LINKED_REPAYMENT_PROFILE_ID,
    nullable: true,
  })
  readonly linkedRepaymentProfileId: number | null;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_EXAMPLE.subtypeCode,
  })
  readonly subtypeCode: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: ACBS_OBLIGATION_ID,
    nullable: true,
  })
  readonly acbsObligationId: number | null;

  @IsArray()
  @ApiProperty({
    example: [ACCRUAL_SCHEDULE],
    isArray: true,
    type: GiftFacilityAccrualScheduleResponseDto,
  })
  readonly fixedRateAccrualSchedules: GiftFacilityAccrualScheduleResponseDto[];
}

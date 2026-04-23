import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from 'class-validator';

import { IsSupportedConsumer, UniqueRepaymentProfileAllocationDates, UniqueRepaymentProfileNames } from '../../custom-decorators';
import { GiftAccrualScheduleRequestDto } from './accrual-schedule';
import { GiftFacilityCounterpartyRequestDto } from './counterparty';
import { GiftFacilityOverviewRequestDto } from './facility-overview';
import { GiftFixedFeeRequestDto } from './fixed-fee';
import { GiftObligationRequestDto } from './obligation';
import { GiftRepaymentProfileRequestDto } from './repayment-profile';

const {
  GIFT: { ACCRUAL_SCHEDULE, COUNTERPARTY, FACILITY_OVERVIEW, FIXED_FEE, OBLIGATION, REPAYMENT_PROFILE },
} = EXAMPLES;

/**
 * GIFT facility creation - generic request DTO.
 * These fields are required for APIM to create a populated facility in GIFT.
 */
export class GiftFacilityCreationGenericRequestDto {
  @IsDefined()
  @IsString()
  @IsSupportedConsumer()
  @ApiProperty({
    example: GIFT.CONSUMER.DTFS,
    required: true,
  })
  consumer: string;

  @ApiProperty({
    example: FACILITY_OVERVIEW,
    required: true,
    type: GiftFacilityOverviewRequestDto,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityOverviewRequestDto)
  @ValidateNested()
  overview: GiftFacilityOverviewRequestDto;

  @ApiProperty({
    isArray: true,
    example: [ACCRUAL_SCHEDULE, ACCRUAL_SCHEDULE],
    required: true,
    type: GiftAccrualScheduleRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftAccrualScheduleRequestDto)
  @ValidateNested()
  accrualSchedules: GiftAccrualScheduleRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [COUNTERPARTY(), COUNTERPARTY()],
    required: true,
    type: GiftFacilityCounterpartyRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftFacilityCounterpartyRequestDto)
  @ValidateNested()
  counterparties: GiftFacilityCounterpartyRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [FIXED_FEE(), FIXED_FEE()],
    required: false,
    type: GiftFixedFeeRequestDto,
  })
  @IsOptional()
  @IsArray()
  @Type(() => GiftFixedFeeRequestDto)
  @ValidateNested()
  fixedFees?: GiftFixedFeeRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [OBLIGATION(), OBLIGATION()],
    required: true,
    type: GiftObligationRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftObligationRequestDto)
  @ValidateNested()
  obligations: GiftObligationRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE()],
    required: false,
    type: GiftRepaymentProfileRequestDto,
  })
  @IsOptional()
  @IsArray()
  @UniqueRepaymentProfileNames()
  @UniqueRepaymentProfileAllocationDates()
  @Type(() => GiftRepaymentProfileRequestDto)
  @ValidateNested()
  repaymentProfiles?: GiftRepaymentProfileRequestDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDefined, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EXAMPLES, GIFT } from '@ukef/constants';

import { IsSupportedConsumer, UniqueRepaymentProfileAllocationDates, UniqueRepaymentProfileNames } from '@ukef/modules/gift/custom-decorators';
import { GiftAccrualScheduleRequestDto } from '@ukef/modules/gift/dto/request/accrual-schedule';
import { GiftFacilityCounterpartyRequestDto } from '@ukef/modules/gift/dto/request/counterparty';
import { GiftFacilityOverviewRequestDto } from '@ukef/modules/gift/dto/request/facility-overview';
import { GiftFixedFeeRequestDto } from '@ukef/modules/gift/dto/request/fixed-fee';
import { GiftObligationRequestDto } from '@ukef/modules/gift/dto/request/obligation';
import { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto/request/repayment-profile';

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
  consumer!: string;

  @ApiProperty({
    example: FACILITY_OVERVIEW,
    required: true,
    type: GiftFacilityOverviewRequestDto,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityOverviewRequestDto)
  @ValidateNested()
  overview!: GiftFacilityOverviewRequestDto;

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
  accrualSchedules!: GiftAccrualScheduleRequestDto[];

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
  counterparties!: GiftFacilityCounterpartyRequestDto[];

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
  obligations!: GiftObligationRequestDto[];

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

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
    description:
      'Indicates whether the creation of the facility should be delayed. For example, if new data was created that ODS/GIFT depends on, ODS needs time to process that data before GIFT can successfully create the facility with it.',
    example: true,
  })
  delayCreation?: boolean;
}

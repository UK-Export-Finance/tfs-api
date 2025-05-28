import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { UniqueCounterpartyUrns, UniqueRepaymentProfileAllocationDates, UniqueRepaymentProfileNames } from '../custom-decorators';
import { GiftFacilityCounterpartyDto } from './facility-counterparty';
import { GiftFacilityOverviewDto } from './facility-overview';
import { GiftFixedFeeDto } from './fixed-fee';
import { GiftObligationDto } from './obligation';
import { GiftRepaymentProfileDto } from './repayment-profile';

const {
  GIFT: { COUNTERPARTY, FACILITY_OVERVIEW, FIXED_FEE, OBLIGATION, REPAYMENT_PROFILE },
} = EXAMPLES;

/**
 * GIFT facility creation DTO.
 * These fields are required for APIM to create a fully populated facility in GIFT.
 */
export class GiftFacilityCreationDto {
  @ApiProperty({
    example: FACILITY_OVERVIEW,
    required: true,
    type: GiftFacilityOverviewDto,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityOverviewDto)
  @ValidateNested()
  overview: GiftFacilityOverviewDto;

  @ApiProperty({
    isArray: true,
    example: [COUNTERPARTY(), COUNTERPARTY()],
    required: true,
    type: GiftFacilityCounterpartyDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @UniqueCounterpartyUrns()
  @Type(() => GiftFacilityCounterpartyDto)
  @ValidateNested()
  counterparties: GiftFacilityCounterpartyDto[];

  @ApiProperty({
    isArray: true,
    example: [FIXED_FEE(), FIXED_FEE()],
    required: true,
    type: GiftFixedFeeDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftFixedFeeDto)
  @ValidateNested()
  fixedFees: GiftFixedFeeDto[];

  @ApiProperty({
    isArray: true,
    example: [OBLIGATION(), OBLIGATION()],
    required: true,
    type: GiftObligationDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftObligationDto)
  @ValidateNested()
  obligations: GiftObligationDto[];

  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE()],
    required: true,
    type: GiftRepaymentProfileDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @UniqueRepaymentProfileNames()
  @UniqueRepaymentProfileAllocationDates()
  @Type(() => GiftRepaymentProfileDto)
  @ValidateNested()
  repaymentProfiles: GiftRepaymentProfileDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import {
  ObligationSubtypeCodeAreSupported,
  UniqueCounterpartyUrns,
  UniqueRepaymentProfileAllocationDates,
  UniqueRepaymentProfileNames,
} from '../../custom-decorators';
import { GiftFacilityCounterpartyRequestDto } from './counterparty';
import { GiftFacilityOverviewRequestDto } from './facility-overview';
import { GiftFixedFeeRequestDto } from './fixed-fee';
import { GiftObligationRequestDto } from './obligation';
import { GiftRepaymentProfileRequestDto } from './repayment-profile';

const {
  GIFT: { COUNTERPARTY, FACILITY_OVERVIEW, FIXED_FEE, OBLIGATION, REPAYMENT_PROFILE },
} = EXAMPLES;

/**
 * GIFT facility creation DTO.
 * These fields are required for APIM to create a fully populated facility in GIFT.
 */
export class GiftFacilityCreationRequestDto {
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
    example: [COUNTERPARTY(), COUNTERPARTY()],
    required: true,
    type: GiftFacilityCounterpartyRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @UniqueCounterpartyUrns()
  @Type(() => GiftFacilityCounterpartyRequestDto)
  @ValidateNested()
  counterparties: GiftFacilityCounterpartyRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [FIXED_FEE(), FIXED_FEE()],
    required: true,
    type: GiftFixedFeeRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftFixedFeeRequestDto)
  @ValidateNested()
  fixedFees: GiftFixedFeeRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [OBLIGATION(), OBLIGATION()],
    required: true,
    type: GiftObligationRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @ObligationSubtypeCodeAreSupported()
  @Type(() => GiftObligationRequestDto)
  @ValidateNested()
  obligations: GiftObligationRequestDto[];

  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE()],
    required: true,
    type: GiftRepaymentProfileRequestDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @UniqueRepaymentProfileNames()
  @UniqueRepaymentProfileAllocationDates()
  @Type(() => GiftRepaymentProfileRequestDto)
  @ValidateNested()
  repaymentProfiles: GiftRepaymentProfileRequestDto[];
}

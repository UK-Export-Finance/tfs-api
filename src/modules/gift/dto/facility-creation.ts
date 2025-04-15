import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { GiftFacilityDto } from './facility';
import { GiftFacilityCounterpartyDto } from './facility-counterparty';
import { GiftRepaymentProfileDto } from './repayment-profile';

const {
  GIFT: { COUNTERPARTY, FACILITY_OVERVIEW, REPAYMENT_PROFILE },
} = EXAMPLES;

/**
 * GIFT facility creation DTO.
 * These fields are required for APIM to create a facility in GIFT.
 */
export class GiftFacilityCreationDto {
  @ApiProperty({
    example: FACILITY_OVERVIEW,
    required: true,
    type: GiftFacilityDto,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityDto)
  @ValidateNested()
  overview: GiftFacilityDto;

  @ApiProperty({
    isArray: true,
    example: [COUNTERPARTY(), COUNTERPARTY()],
    required: true,
    type: GiftFacilityCounterpartyDto,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftFacilityCounterpartyDto)
  @ValidateNested()
  counterparties: GiftFacilityCounterpartyDto[];

  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE(), REPAYMENT_PROFILE()],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftRepaymentProfileDto)
  @ValidateNested()
  repaymentProfiles: GiftRepaymentProfileDto[];

  /**
   * NOTE: the below properties are purely for example/context purposes.
   * These will be populated in upcoming PRs:
   * GIFT-10025
   * GIFT-10026
   */
  fees: [];
  obligations: [];
}

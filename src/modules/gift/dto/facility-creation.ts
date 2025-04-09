import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { GiftFacilityDto } from './facility';
import { GiftFacilityCounterpartyDto } from './facility-counterparty';

const {
  GIFT: { COUNTERPARTY_DATA, FACILITY_OVERVIEW_DATA },
} = EXAMPLES;

/**
 * GIFT facility creation DTO.
 * These fields are required for APIM to create a facility in GIFT.
 */
export class GiftFacilityCreationDto {
  @ApiProperty({
    example: FACILITY_OVERVIEW_DATA,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityDto)
  @ValidateNested()
  overview: GiftFacilityDto;

  @ApiProperty({
    example: [COUNTERPARTY_DATA(), COUNTERPARTY_DATA()],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftFacilityCounterpartyDto)
  @ValidateNested()
  counterparties: GiftFacilityCounterpartyDto[];

  /**
   * NOTE: the below properties are purely for example/context purposes.
   * These will be populated in upcoming PRs:
   * GIFT-10023
   * GIFT-10024
   * GIFT-10025
   * GIFT-10026
   */
  fees: [];
  obligations: [];
  repaymentProfiles: [];
}

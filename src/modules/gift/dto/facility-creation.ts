import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { GiftFacilityDto } from './facility';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

/**
 * GIFT facility creation DTO.
 * These fields are required for APIM to create a facility in GIFT.
 */
export class GiftFacilityCreationDto {
  @ApiProperty({
    example: FACILITY_CREATION_PAYLOAD,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityDto)
  @ValidateNested()
  overview: GiftFacilityDto;

  /**
   * NOTE: the below properties are purely for example/context purposes.
   * These will be populated in upcoming PRs:
   * GIFT-10023
   * GIFT-10024
   * GIFT-10025
   * GIFT-10026
   */
  counterParties: [];
  fees: [];
  obligations: [];
  repaymentProfiles: [];
}

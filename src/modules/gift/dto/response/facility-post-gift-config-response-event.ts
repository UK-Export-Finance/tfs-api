import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';

import { GiftFacilityResponseDto } from './facility-get-gift-response';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility config POST response DTO.
 * This is subset of fields returned from GIFT when getting a facility work package.
 */
export class GiftFacilityConfigPostResponseDto {
  @IsObject()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data,
    required: true,
    type: GiftFacilityResponseDto,
  })
  @Type(() => GiftFacilityResponseDto)
  data: GiftFacilityResponseDto;
}

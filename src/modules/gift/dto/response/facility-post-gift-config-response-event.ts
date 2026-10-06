import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

import type { GiftFacilityResponseDto } from '@ukef/modules/gift/dto';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility "config" POST response DTO.
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
  readonly data: GiftFacilityResponseDto;
}

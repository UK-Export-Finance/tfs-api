import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsObject } from 'class-validator';

import { GiftFacilityResponseDto } from './facility-get';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility config POST response DTO.
 * These fields are returned from GIFT when creating a facility.
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

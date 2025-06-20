import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';

import { GiftFacilityConfigPostResponseDto } from './facility-post-gift-config-response-event';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when creating a facility.
 */
export class GiftFacilityPostResponseDto {
  @IsObject()
  @ApiProperty({
    example: EXAMPLE.configurationEvent,
    required: true,
    type: GiftFacilityConfigPostResponseDto,
  })
  @Type(() => GiftFacilityConfigPostResponseDto)
  configurationEvent: GiftFacilityConfigPostResponseDto;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.workPackageId,
  })
  workPackageId: number;
}

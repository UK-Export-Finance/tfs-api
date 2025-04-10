import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsNumber } from 'class-validator';

import { GiftFacilityGetResponseDto } from './facility-get';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when creating a facility.
 */
export class GiftFacilityPostResponseDto extends GiftFacilityGetResponseDto {
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.workPackageId,
  })
  workPackageId: number;
}

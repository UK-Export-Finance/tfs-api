import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

import type { GiftFacilityConfigPostResponseDto } from '@ukef/modules/gift/dto';

const {
  GIFT: { FACILITY_RESPONSE_DATA },
} = EXAMPLES;

const EXAMPLE = FACILITY_RESPONSE_DATA as {
  configurationEvent: {
    data: unknown;
  };
  workPackageId: number;
};

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
  readonly configurationEvent: GiftFacilityConfigPostResponseDto;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.workPackageId,
  })
  readonly workPackageId: number;
}

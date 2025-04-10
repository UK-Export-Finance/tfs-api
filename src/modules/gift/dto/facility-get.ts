import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { GiftFacilityDto } from './facility';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when getting or creating a facility.
 */
export class GiftFacilityResponseDto extends GiftFacilityDto {
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.availableAmount,
  })
  availableAmount: number;

  @ApiProperty({
    example: EXAMPLE.createdDatetime,
  })
  createdDatetime: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.drawnAmount,
  })
  drawnAmount: number;

  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.isDraft,
  })
  isDraft: boolean;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.streamId,
  })
  streamId: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.streamVersion,
  })
  streamVersion: number;
}

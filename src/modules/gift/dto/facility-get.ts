import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { GiftFacilityDto } from './facility';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when getting a facility.
 */
export class GiftFacilityResponseDto extends GiftFacilityDto {
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.availableAmount,
  })
  availableAmount: number;

  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.createdDatetime,
  })
  createdDatetime: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.drawnAmount,
  })
  drawnAmount: number;

  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.isDraft,
  })
  isDraft: boolean;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.streamId,
  })
  streamId: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.eventData.streamVersion,
  })
  streamVersion: number;
}

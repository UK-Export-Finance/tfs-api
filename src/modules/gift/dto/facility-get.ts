import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { GiftFacilityOverviewDto } from './facility-overview';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when getting a facility.
 */
export class GiftFacilityResponseDto extends GiftFacilityOverviewDto {
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.availableAmount,
  })
  availableAmount: number;

  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.createdDatetime,
  })
  createdDatetime: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.drawnAmount,
  })
  drawnAmount: number;

  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.isDraft,
  })
  isDraft: boolean;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.streamId,
  })
  streamId: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.streamVersion,
  })
  streamVersion: number;
}

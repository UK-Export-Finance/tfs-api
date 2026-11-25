import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

import { GiftFacilityOverviewRequestDto } from '@ukef/modules/gift/dto/request/facility-overview';

const {
  GIFT: { FACILITY_RESPONSE_DATA: EXAMPLE },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when getting a facility.
 */
export class GiftFacilityResponseDto extends GiftFacilityOverviewRequestDto {
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.availableAmount,
  })
  readonly availableAmount!: number;

  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.createdDatetime,
  })
  createdDatetime!: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.drawnAmount,
  })
  readonly drawnAmount!: number;

  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.isDraft,
  })
  readonly isDraft!: boolean;

  @IsString()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.streamId,
  })
  readonly streamId!: string;

  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.configurationEvent.data.streamVersion,
  })
  readonly streamVersion!: number;
}

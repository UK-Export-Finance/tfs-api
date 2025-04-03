import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { GiftFacilityDto } from './facility';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

/**
 * GIFT facility response DTO.
 * These fields are returned from GIFT when getting or creating a facility.
 */
export class GiftFacilityResponseDto extends GiftFacilityDto {
  @IsNumber()
  @ApiProperty({
    example: FACILITY.AVAILABLE_AMOUNT,
  })
  availableAmount: number;

  @ApiProperty({
    example: FACILITY.CREATED_DATE_TIME,
  })
  createdDatetime: string;

  @IsNumber()
  @ApiProperty({
    example: FACILITY.DRAWN_AMOUNT,
  })
  drawnAmount: number;

  @IsBoolean()
  @ApiProperty({
    example: FACILITY.IS_DRAFT,
  })
  isDraft: boolean;

  @IsString()
  @ApiProperty({
    example: FACILITY.STREAM_ID,
  })
  streamId: string;

  @IsNumber()
  @ApiProperty({
    example: FACILITY.STREAM_VERSION,
  })
  streamVersion: number;

  @IsNumber()
  @ApiProperty({
    example: FACILITY.WORK_PACKAGE_ID,
  })
  workPackageId: number;
}

import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

import type { GiftWorkPackageResponseDto } from '@ukef/modules/gift/dto';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA },
} = EXAMPLES;

export class CreateGiftFacilityAmendmentResponseDto {
  @IsString()
  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  readonly status: number;

  @IsObject()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA,
  })
  readonly data: GiftWorkPackageResponseDto;
}

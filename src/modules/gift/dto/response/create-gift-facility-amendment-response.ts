import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsObject, IsString } from 'class-validator';

import { GiftWorkPackageResponseDto } from './work-package-response';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA },
} = EXAMPLES;

export class CreateGiftFacilityAmendmentResponseDto {
  @IsString()
  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  readonly status: string;

  @IsObject()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA,
  })
  readonly data: GiftWorkPackageResponseDto;
}

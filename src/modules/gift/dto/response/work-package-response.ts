import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsObject, IsString } from 'class-validator';

const {
  GIFT: { WORK_PACKAGE_CREATION_RESPONSE_DATA },
} = EXAMPLES;

/**
 * GIFT "work package" response DTO.
 * These fields are returned in a response when:
 * - Creating a "work package" in GIFT.
 * - Adding an amendment (configuration event) to a work package.
 */
export class GiftWorkPackageResponseDto {
  @IsString()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA.id,
  })
  readonly id: number;

  @IsString()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA.type,
  })
  readonly type: string;

  @IsBoolean()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA.isApproved,
  })
  readonly isApproved: boolean;

  @IsString()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA.createdByUserId,
  })
  readonly createdByUserId: string;

  @IsObject()
  @ApiProperty({
    example: WORK_PACKAGE_CREATION_RESPONSE_DATA.data,
  })
  readonly data: object;
}

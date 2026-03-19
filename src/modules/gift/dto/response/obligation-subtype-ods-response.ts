import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { GIFT } from '../../../../constants/gift/gift.constant';

const { OBLIGATION_SUBTYPES } = GIFT;

/**
 * GIFT "obligation subtype" response DTO.
 * These fields are returned from GIFT when getting an obligation subtype
 */
export class GiftObligationSubtypeResponseDto {
  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.type,
  })
  readonly type: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.typeCode,
  })
  readonly typeCode: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.code,
  })
  readonly code: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.description,
  })
  readonly description: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST001.isActive,
  })
  readonly isActive: boolean;
}

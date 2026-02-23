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
    example: OBLIGATION_SUBTYPES.OST009.code,
    required: true,
  })
  readonly code: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST009.name,
    required: true,
  })
  readonly name: string;

  @IsString()
  @ApiProperty({
    example: OBLIGATION_SUBTYPES.OST009.productTypeCode,
    required: true,
  })
  readonly productTypeCode: string;
}

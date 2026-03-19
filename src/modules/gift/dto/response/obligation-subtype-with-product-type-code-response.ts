import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { GiftObligationSubtypeResponseDto } from './obligation-subtype-ods-response';

/**
 * GIFT "obligation subtype with product type code" response DTO.
 * These fields are returned from GIFT when getting an obligation subtype with a product type code
 */
export class GiftObligationSubtypeWithProductTypeCodeResponseDto extends GiftObligationSubtypeResponseDto {
  @IsString()
  @ApiProperty({
    example: 'TODO',
  })
  readonly productTypeCode: string;
}

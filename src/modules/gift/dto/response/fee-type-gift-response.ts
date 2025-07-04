import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsString } from 'class-validator';

const {
  GIFT: { FEE_TYPES },
} = EXAMPLES;

export interface GiftFacilityFeeTypeResponse {
  feeTypes: GiftFacilityFeeTypeResponseDto[];
}

/**
 * GIFT facility fee type DTO.
 * These fields are returned by GIFT when getting fee types
 */
export class GiftFacilityFeeTypeResponseDto {
  @IsString()
  @ApiProperty({
    example: FEE_TYPES.BEX.code,
    required: true,
  })
  readonly code: string;

  @IsString()
  @ApiProperty({
    example: FEE_TYPES.BEX.description,
    required: true,
  })
  readonly description: string;
}

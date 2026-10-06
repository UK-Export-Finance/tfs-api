import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EXAMPLES } from '@ukef/constants';

const {
  GIFT: { FEE_TYPES },
} = EXAMPLES;

export type GiftFacilityFeeTypeResponse = {
  feeTypes: GiftFeeTypeResponseDto[];
};

/**
 * GIFT facility "fee type" response DTO.
 * These fields are returned by GIFT when getting fee types
 */
export class GiftFeeTypeResponseDto {
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

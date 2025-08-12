import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsString, Length, ValidateNested } from 'class-validator';

import { GiftRepaymentProfileAllocationRequestDto } from './repayment-profile-allocation';

const {
  GIFT: { REPAYMENT_PROFILE, REPAYMENT_PROFILE_ALLOCATION },
} = EXAMPLES;

const {
  VALIDATION: { REPAYMENT_PROFILE: VALIDATION },
} = GIFT;

/**
 * GIFT "repayment profile" request DTO.
 * These fields are required for APIM to create a "repayment profile" in GIFT.
 */
export class GiftRepaymentProfileRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.NAME.MIN_LENGTH, VALIDATION.NAME.MAX_LENGTH)
  @ApiProperty({
    example: REPAYMENT_PROFILE().name,
    required: true,
  })
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => GiftRepaymentProfileAllocationRequestDto)
  @ValidateNested()
  @ApiProperty({
    isArray: true,
    example: [REPAYMENT_PROFILE_ALLOCATION(), REPAYMENT_PROFILE_ALLOCATION()],
    required: true,
    type: GiftRepaymentProfileAllocationRequestDto,
  })
  allocations: GiftRepaymentProfileAllocationRequestDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDefined, IsNumber, IsString, Length, Min } from 'class-validator';

const {
  GIFT: { REPAYMENT_PROFILE_ALLOCATION },
} = EXAMPLES;

const {
  VALIDATION: {
    REPAYMENT_PROFILE: { ALLOCATION: VALIDATION },
  },
} = GIFT;

/**
 * GIFT repayment profile allocation DTO.
 * These fields are required for APIM to create a repayment profile allocation in GIFT.
 */
export class GiftRepaymentProfileAllocationDto {
  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.AMOUNT.MIN)
  @ApiProperty({
    example: REPAYMENT_PROFILE_ALLOCATION().amount,
    required: true,
  })
  amount: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.DUE_DATE.MIN_LENGTH, VALIDATION.DUE_DATE.MAX_LENGTH)
  @ApiProperty({
    example: REPAYMENT_PROFILE_ALLOCATION().dueDate,
    required: true,
  })
  dueDate: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsNumber, Max, Min } from 'class-validator';
import { EXAMPLES, GIFT } from '@ukef/constants';

const {
  GIFT: { REPAYMENT_PROFILE_ALLOCATION },
} = EXAMPLES;

const {
  VALIDATION: {
    REPAYMENT_PROFILE: { ALLOCATION: VALIDATION },
  },
} = GIFT;

const EXAMPLE = REPAYMENT_PROFILE_ALLOCATION() as {
  amount: number;
  dueDate: string;
};

/**
 * GIFT "repayment profile allocation" request DTO.
 * These fields are required for APIM to create a "repayment profile allocation" in GIFT.
 */
export class GiftRepaymentProfileAllocationRequestDto {
  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.AMOUNT.MIN)
  @Max(VALIDATION.AMOUNT.MAX)
  @ApiProperty({
    example: EXAMPLE.amount,
    required: true,
  })
  amount!: number;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.dueDate,
    required: true,
  })
  dueDate!: string;
}

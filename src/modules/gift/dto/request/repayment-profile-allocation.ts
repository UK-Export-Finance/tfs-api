import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, Max, Min } from 'class-validator';

const {
  GIFT: { REPAYMENT_PROFILE_ALLOCATION },
} = EXAMPLES;

const {
  VALIDATION: {
    REPAYMENT_PROFILE: { ALLOCATION: VALIDATION },
  },
} = GIFT;

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
    example: REPAYMENT_PROFILE_ALLOCATION().amount,
    required: true,
  })
  amount: number;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: REPAYMENT_PROFILE_ALLOCATION().dueDate,
    required: true,
  })
  dueDate: string;
}

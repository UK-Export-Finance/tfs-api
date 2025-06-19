import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, IsString, Length, Max, Min } from 'class-validator';

import { IsSupportedCurrency, IsSupportedFeeType } from '../custom-decorators';

const {
  GIFT: { FIXED_FEE },
} = EXAMPLES;

const {
  VALIDATION: { FIXED_FEE: VALIDATION },
} = GIFT;

/**
 * GIFT fixed fee DTO.
 * These fields are required for APIM to create a fixed fee in GIFT.
 */
export class GiftFixedFeeDto {
  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.AMOUNT_DUE.MIN)
  @Max(VALIDATION.AMOUNT_DUE.MAX)
  @ApiProperty({
    required: true,
    example: FIXED_FEE().amountDue,
  })
  amountDue: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @IsSupportedCurrency()
  @ApiProperty({
    required: true,
    example: FIXED_FEE().currency,
  })
  currency: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.DESCRIPTION.MIN_LENGTH, VALIDATION.DESCRIPTION.MAX_LENGTH)
  @ApiProperty({
    required: true,
    example: FIXED_FEE().description,
  })
  description: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    required: true,
    example: FIXED_FEE().effectiveDate,
  })
  effectiveDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.FEE_TYPE_CODE.MIN_LENGTH, VALIDATION.FEE_TYPE_CODE.MAX_LENGTH)
  @IsSupportedFeeType()
  @ApiProperty({
    required: true,
    example: FIXED_FEE().feeTypeCode,
  })
  feeTypeCode: string;
}

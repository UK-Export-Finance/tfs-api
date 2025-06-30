import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { OBLIGATION },
} = EXAMPLES;

const {
  VALIDATION: { OBLIGATION: VALIDATION },
} = GIFT;

/**
 * GIFT obligation DTO.
 * These fields are required for APIM to create an obligation in GIFT.
 */
export class GiftObligationRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @ApiProperty({
    example: OBLIGATION().currency,
    required: true,
  })
  currency: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: OBLIGATION().effectiveDate,
    required: true,
  })
  effectiveDate: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: OBLIGATION().maturityDate,
    required: true,
  })
  maturityDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.OBLIGATION_AMOUNT.MIN)
  @Max(VALIDATION.OBLIGATION_AMOUNT.MAX)
  @ApiProperty({
    example: OBLIGATION().amount,
    required: true,
  })
  amount: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.OBLIGATION_SUBTYPE_CODE.MIN_LENGTH, VALIDATION.OBLIGATION_SUBTYPE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: OBLIGATION().subtypeCode,
    required: true,
  })
  subtypeCode: string;
}

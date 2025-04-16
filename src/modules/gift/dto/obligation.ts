import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDefined, IsNumber, IsString, Length, Min } from 'class-validator';

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
export class GiftObligationDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @ApiProperty({
    example: OBLIGATION().currency,
    required: true,
  })
  currency: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EFFECTIVE_DATE.MIN_LENGTH, VALIDATION.EFFECTIVE_DATE.MAX_LENGTH)
  @ApiProperty({
    example: OBLIGATION().effectiveDate,
    required: true,
  })
  effectiveDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.MATURITY_DATE.MIN_LENGTH, VALIDATION.MATURITY_DATE.MAX_LENGTH)
  @ApiProperty({
    example: OBLIGATION().maturityDate,
    required: true,
  })
  maturityDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.OBLIGATION_AMOUNT.MIN)
  @ApiProperty({
    example: OBLIGATION().obligationAmount,
    required: true,
  })
  obligationAmount: number;

  @IsDefined()
  @IsString()
  // @Length(VALIDATION.PRODUCT_SUBTYPE.MIN_LENGTH, VALIDATION.PRODUCT_SUBTYPE.MAX_LENGTH)
  @Length(VALIDATION.PRODUCT_SUBTYPE.MIN_LENGTH)
  @ApiProperty({
    example: OBLIGATION().productSubtype,
    required: true,
  })
  productSubtype: string;
}

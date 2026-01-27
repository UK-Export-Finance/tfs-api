import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { OBLIGATION },
} = EXAMPLES;

const {
  VALIDATION: { OBLIGATION: VALIDATION },
} = GIFT;

const EXAMPLE = OBLIGATION() as {
  currency: string;
  effectiveDate: string;
  maturityDate: string;
  amount: number;
  subtypeCode: string;
};

/**
 * GIFT "obligation" request DTO.
 * These fields are required for APIM to create an "obligation" in GIFT.
 */
export class GiftObligationRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.currency,
    required: true,
  })
  currency: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.effectiveDate,
    required: true,
  })
  effectiveDate: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.maturityDate,
    required: true,
  })
  maturityDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.OBLIGATION_AMOUNT.MIN)
  @Max(VALIDATION.OBLIGATION_AMOUNT.MAX)
  @ApiProperty({
    example: EXAMPLE.amount,
    required: true,
  })
  amount: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.OBLIGATION_SUBTYPE_CODE.MIN_LENGTH, VALIDATION.OBLIGATION_SUBTYPE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.subtypeCode,
    required: true,
  })
  subtypeCode: string;

  // TODO: acbsObligationId
}

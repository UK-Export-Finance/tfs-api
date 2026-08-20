import { ApiProperty } from '@nestjs/swagger';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IsDateString, IsDefined, IsNumber, Max, Min } from 'class-validator';

const { VALIDATION } = GIFT;

/**
 * AmountDto is the base DTO for an amendment that involves an amount and a date.
 * It contains the amount and the date, both of which are validated.
 */
export class AmountDto {
  @IsDefined()
  @IsNumber({ maxDecimalPlaces: VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX_DECIMAL_PLACES })
  @Min(VALIDATION.FACILITY.AMENDMENT.AMOUNT.MIN)
  @Max(VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX)
  @ApiProperty({
    required: true,
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT.amount,
    type: 'number',
  })
  amount: number;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    required: true,
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT.date,
  })
  date: string;
}

/**
 * DecreaseAmountDto is the DTO for an amendment that decreases the amount of a facility.
 * It extends AmountDto and inherits its validation rules.
 */
export class DecreaseAmountDto extends AmountDto {}

/**
 * IncreaseAmountDto is the DTO for an amendment that increases the amount of a facility.
 * It extends AmountDto and inherits its validation rules.
 */
export class IncreaseAmountDto extends AmountDto {}

/**
 * ReplaceExpiryDateDto is the DTO for an amendment that replaces the expiry date of a facility.
 * It contains the new expiry date, which is validated.s
 */
export class ReplaceExpiryDateDto {
  @IsDefined()
  @IsDateString()
  @ApiProperty({
    required: true,
    description: 'The new expiry date for the facility.',
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE.expiryDate,
  })
  expiryDate: string;
}

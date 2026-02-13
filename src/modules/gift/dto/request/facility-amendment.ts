import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AmendFacilityType, GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { IsDefined, IsObject, IsString, Length } from 'class-validator';

const { AMEND_FACILITY_TYPES, VALIDATION } = GIFT;

export class AmountDto {
  @IsDefined()
  @IsString()
  @ApiProperty({
    required: true,
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT.amount,
  })
  amount: number;

  @IsDefined()
  @IsString()
  @ApiProperty({
    required: true,
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT.date,
  })
  date: string;
}

export class DecreaseAmountDto extends AmountDto {}
export class IncreaseAmountDto extends AmountDto {}

export class GiftFacilityAmendmentRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH, VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH)
  @ApiProperty({
    required: true,
    enum: Object.values(AMEND_FACILITY_TYPES),
  })
  amendmentType: AmendFacilityType;

  @IsDefined()
  @IsObject()
  @ApiProperty({
    required: true,
    example: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.DECREASE_AMOUNT,
    oneOf: [{ $ref: getSchemaPath(DecreaseAmountDto) }, { $ref: getSchemaPath(IncreaseAmountDto) }],
  })
  amendmentData: DecreaseAmountDto | IncreaseAmountDto;
}

import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AMEND_FACILITY_TYPES_ARRAY, AmendFacilityType, GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { plainToInstance, Transform } from 'class-transformer';
import { IsDateString, IsDefined, IsIn, IsNotEmptyObject, IsNumber, IsString, Length, Max, Min, ValidateNested } from 'class-validator';

const { VALIDATION } = GIFT;

export class AmountDto {
  @IsDefined()
  @IsNumber()
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

export class DecreaseAmountDto extends AmountDto {}
export class IncreaseAmountDto extends AmountDto {}

@ApiExtraModels(DecreaseAmountDto, IncreaseAmountDto)
export class CreateGiftFacilityAmendmentRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH, VALIDATION.FACILITY.AMENDMENT_TYPE.MAX_LENGTH)
  @IsIn(AMEND_FACILITY_TYPES_ARRAY)
  @ApiProperty({
    required: true,
    enum: AMEND_FACILITY_TYPES_ARRAY,
  })
  amendmentType: AmendFacilityType;

  @IsNotEmptyObject()
  @IsDefined()
  @Transform(
    ({ value, obj }) => {
      /**
       * Depending on the provided amendmentType, we need to transform the amendmentData into the correct DTO type,
       * so that the correct validation rules are applied.
       * We cannot determine the correct type to transform to until we have access to the entire object;
       * So we use a "Transform" decorator from class-transformer with toClassOnly: true,
       * to perform this transformation after the entire object has been transformed into a class instance, but before validation occurs.
       */
      const { amendmentType } = obj;

      const Decrease = GIFT.AMEND_FACILITY_TYPES.AMEND_FACILITY_DECREASE_AMOUNT;
      const Target = amendmentType === Decrease ? DecreaseAmountDto : IncreaseAmountDto;

      return plainToInstance(Target, value);
    },
    { toClassOnly: true },
  )
  @ValidateNested()
  @ApiProperty({
    required: true,
    oneOf: [{ $ref: getSchemaPath(DecreaseAmountDto) }, { $ref: getSchemaPath(IncreaseAmountDto) }],
  })
  amendmentData: DecreaseAmountDto | IncreaseAmountDto;
}

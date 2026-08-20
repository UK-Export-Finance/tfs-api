import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { AMEND_FACILITY_TYPES_CONSUMER_ARRAY, AmendFacilityTypeConsumer, GIFT } from '@ukef/constants';
import { plainToInstance, Transform } from 'class-transformer';
import { IsDefined, IsIn, IsObject, IsString, Length, ValidateNested } from 'class-validator';

import { getAmendmentDataDto } from '../../helpers';
import { DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto } from './facility-amendment-shared';

const { VALIDATION } = GIFT;

/**
 * CreateGiftFacilityAmendmentRequestDto is the DTO for a request to create a facility amendment in GIFT.
 * It contains the amendment type and the amendment data, which is validated based on the amendment type.
 * The amendment data is transformed into the correct DTO type based on the amendment type, so that the correct validation rules are applied.
 * The amendment data can be one of DecreaseAmountDto, IncreaseAmountDto, or ReplaceExpiryDateDto.
 * The amendment type and data is validated.
 */
@ApiExtraModels(DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto)
export class CreateGiftFacilityAmendmentRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH, VALIDATION.FACILITY.AMENDMENT_TYPE.MAX_LENGTH)
  @IsIn(AMEND_FACILITY_TYPES_CONSUMER_ARRAY)
  @ApiProperty({
    required: true,
    enum: AMEND_FACILITY_TYPES_CONSUMER_ARRAY,
  })
  amendmentType: AmendFacilityTypeConsumer;

  @IsObject()
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

      const amendmentDataDto = getAmendmentDataDto(amendmentType);

      if (!amendmentDataDto) {
        /**
         * If we cannot determine a DTO for the given amendmentType (e.g. invalid type),
         * return the original value so that amendmentType validation can handle the error.
         */
        return value;
      }

      return plainToInstance(amendmentDataDto, value);
    },
    { toClassOnly: true },
  )
  @ValidateNested()
  @ApiProperty({
    required: true,
    oneOf: [{ $ref: getSchemaPath(DecreaseAmountDto) }, { $ref: getSchemaPath(IncreaseAmountDto) }, { $ref: getSchemaPath(ReplaceExpiryDateDto) }],
  })
  amendmentData: DecreaseAmountDto | IncreaseAmountDto | ReplaceExpiryDateDto;
}

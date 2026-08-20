import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, ValidateNested } from 'class-validator';

import { CreateGiftFacilityAmendmentRequestDto } from './facility-amendment';
import { DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto } from './facility-amendment-shared';

/**
 * CreateGiftFacilityMultipleAmendmentsRequestDto is the DTO for a request to create multiple facility amendments in GIFT.
 * It contains an array of CreateGiftFacilityAmendmentRequestDto, each representing a single amendment.
 */
@ApiExtraModels(DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto)
export class CreateGiftFacilityMultipleAmendmentsRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => CreateGiftFacilityAmendmentRequestDto)
  @ValidateNested()
  @ApiProperty({
    required: true,
    type: 'array',
    isArray: true,
    items: {
      $ref: getSchemaPath(CreateGiftFacilityAmendmentRequestDto),
    },
  })
  amendments: CreateGiftFacilityAmendmentRequestDto[];
}

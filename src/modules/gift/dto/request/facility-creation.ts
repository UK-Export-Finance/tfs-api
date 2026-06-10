import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { Type } from 'class-transformer';
import { IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { GiftFacilityCreationGenericRequestDto } from './facility-creation-generic';
import { GiftFacilityRiskDetailsRequestDto } from './risk-details';

const {
  GIFT: { RISK_DETAILS },
} = EXAMPLES;

/**
 * GIFT facility creation request DTO.
 * Extends the generic request DTO, adding additional properties,
 * that return additional fields between the request and response.
 * These fields are required for APIM to create a fully populated facility in GIFT.
 */
export class GiftFacilityCreationRequestDto extends GiftFacilityCreationGenericRequestDto {
  @ApiProperty({
    example: RISK_DETAILS,
    required: true,
    type: GiftFacilityRiskDetailsRequestDto,
  })
  @IsNotEmptyObject()
  @IsDefined()
  @Type(() => GiftFacilityRiskDetailsRequestDto)
  @ValidateNested()
  riskDetails: GiftFacilityRiskDetailsRequestDto;
}

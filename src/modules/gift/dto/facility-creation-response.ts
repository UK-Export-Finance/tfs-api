import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsString } from 'class-validator';

import { GiftFacilityCreationDto } from './facility-creation';

/**
 * TODO
 * GIFT facility creation response DTO.
 * This is what APIM returns after successfully creating a facility in GIFT.
 */
export class GiftFacilityCreationResponseDto extends GiftFacilityCreationDto {
  @IsString()
  @ApiProperty({
    example: EXAMPLES.GIFT.STATES.APPROVED,
  })
  state: string;
}

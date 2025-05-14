import { ApiProperty } from '@nestjs/swagger';
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
    example: 'APPROVED',
  })
  state: string;
}

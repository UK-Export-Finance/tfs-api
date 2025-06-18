import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsString } from 'class-validator';

const {
  GIFT: { COUNTERPARTY_ROLE },
} = EXAMPLES;

/**
 * GIFT facility counterparty role DTO.
 * These fields are returned by GIFT.
 */
export class GiftFacilityCounterpartyRoleDto {
  @IsString()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.LEAD_ECA.id,
    required: true,
  })
  id: string;

  @IsString()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.LEAD_ECA.name,
    required: true,
  })
  name: string;

  @IsBoolean()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.LEAD_ECA.hasSharePercentage,
    required: true,
  })
  hasSharePercentage: boolean;
}

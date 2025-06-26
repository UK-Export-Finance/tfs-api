import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsString } from 'class-validator';

const {
  GIFT: { COUNTERPARTY_ROLE },
} = EXAMPLES;

/**
 * GIFT facility counterparty role DTO.
 * These fields are returned by GIFT when getting counterparty roles.
 */
export class GiftFacilityCounterpartyRoleResponseDto {
  @IsString()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.LEAD_ECA.code,
    required: true,
  })
  code: string;

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

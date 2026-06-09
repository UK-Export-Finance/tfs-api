import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsBoolean, IsString } from 'class-validator';

const {
  GIFT: { COUNTERPARTY_ROLE },
} = EXAMPLES;

export interface GiftFacilityCounterpartyRolesResponse {
  counterpartyRoles: GiftFacilityCounterpartyRoleResponseDto[];
}

/**
 * GIFT facility "counterparty role" response DTO.
 * These fields are returned by GIFT when getting "counterparty roles".
 */
export class GiftFacilityCounterpartyRoleResponseDto {
  @IsString()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.EXPORTER.code,
    required: true,
  })
  readonly code: string;

  @IsString()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.EXPORTER.name,
    required: true,
  })
  readonly name: string;

  @IsBoolean()
  @ApiProperty({
    example: COUNTERPARTY_ROLE.EXPORTER.hasSharePercentage,
    required: true,
  })
  readonly hasSharePercentage: boolean;
}

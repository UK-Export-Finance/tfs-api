import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { IsDefined, IsNumber, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { COUNTERPARTY },
} = EXAMPLES;

/**
 * GIFT facility counterparty DTO.
 * These fields are required for APIM to create a facility counterparty in GIFT.
 */
export class GiftFacilityCounterpartyDto {
  @IsDefined()
  @IsString()
  @Length(8, 8)
  @ApiProperty({
    example: COUNTERPARTY.COUNTERPARTY_URN,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsString()
  @Length(10, 10)
  @ApiProperty({
    example: COUNTERPARTY.EXIT_DATE,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    example: COUNTERPARTY.ROLE_ID,
  })
  roleId: string;

  @IsDefined()
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({
    example: COUNTERPARTY.SHARE_PERCENTAGE,
  })
  sharePercentage: number;

  @IsDefined()
  @IsString()
  @Length(10, 10)
  @ApiProperty({
    example: COUNTERPARTY.START_DATE,
  })
  startDate: string;
}

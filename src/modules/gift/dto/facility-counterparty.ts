import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDefined, IsNumber, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { COUNTERPARTY },
} = EXAMPLES;

const {
  VALIDATION: { COUNTERPARTY: VALIDATION },
} = GIFT;

/**
 * GIFT facility counterparty DTO.
 * These fields are required for APIM to create a facility counterparty in GIFT.
 */
export class GiftFacilityCounterpartyDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.COUNTERPARTY_URN.MIN, VALIDATION.COUNTERPARTY_URN.MAX)
  @ApiProperty({
    example: COUNTERPARTY.COUNTERPARTY_URN,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EXIT_DATE.MIN, VALIDATION.EXIT_DATE.MAX)
  @ApiProperty({
    example: COUNTERPARTY.EXIT_DATE,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ROLE_ID.MIN, VALIDATION.ROLE_ID.MAX)
  @ApiProperty({
    example: COUNTERPARTY.ROLE_ID,
  })
  roleId: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.SHARE_PERCENTAGE.MIN)
  @Max(VALIDATION.SHARE_PERCENTAGE.MAX)
  @ApiProperty({
    example: COUNTERPARTY.SHARE_PERCENTAGE,
  })
  sharePercentage: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.START_DATE.MIN, VALIDATION.START_DATE.MAX)
  @ApiProperty({
    example: COUNTERPARTY.START_DATE,
  })
  startDate: string;
}

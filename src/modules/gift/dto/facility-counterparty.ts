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
  @Length(VALIDATION.COUNTERPARTY_URN.MIN_LENGTH, VALIDATION.COUNTERPARTY_URN.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().counterpartyUrn,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EXIT_DATE.MIN_LENGTH, VALIDATION.EXIT_DATE.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().exitDate,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ROLE_ID.MIN_LENGTH, VALIDATION.ROLE_ID.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().roleId,
  })
  roleId: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.SHARE_PERCENTAGE.MIN)
  @Max(VALIDATION.SHARE_PERCENTAGE.MAX)
  @ApiProperty({
    example: COUNTERPARTY().sharePercentage,
  })
  sharePercentage: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.START_DATE.MIN_LENGTH, VALIDATION.START_DATE.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().startDate,
  })
  startDate: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDefined, IsString, Length } from 'class-validator';

import { CounterpartySharePercentageValidation, IsSupportedCounterpartyRole } from '../custom-decorators';

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
    required: true,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EXIT_DATE.MIN_LENGTH, VALIDATION.EXIT_DATE.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().exitDate,
    required: true,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ROLE_CODE.MIN_LENGTH, VALIDATION.ROLE_CODE.MAX_LENGTH)
  @IsSupportedCounterpartyRole()
  @ApiProperty({
    example: COUNTERPARTY().roleCode,
    required: true,
  })
  roleCode: string;

  @CounterpartySharePercentageValidation()
  @ApiProperty({
    example: COUNTERPARTY().sharePercentage,
    description: "Required if a counterparty's role has a true hasSharePercentage property",
  })
  sharePercentage: number;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.START_DATE.MIN_LENGTH, VALIDATION.START_DATE.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().startDate,
    required: true,
  })
  startDate: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsString, Length } from 'class-validator';

import { CounterpartySharePercentageValidation } from '../../custom-decorators';

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
export class GiftFacilityCounterpartyRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.COUNTERPARTY_URN.MIN_LENGTH, VALIDATION.COUNTERPARTY_URN.MAX_LENGTH)
  @ApiProperty({
    example: COUNTERPARTY().counterpartyUrn,
    required: true,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: COUNTERPARTY().exitDate,
    required: true,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ROLE_CODE.MIN_LENGTH, VALIDATION.ROLE_CODE.MAX_LENGTH)
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
  @IsDateString()
  @ApiProperty({
    example: COUNTERPARTY().startDate,
    required: true,
  })
  startDate: string;
}

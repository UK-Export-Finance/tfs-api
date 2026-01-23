import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { IsDateString, IsDefined, IsNumber, IsOptional, IsString, Length } from 'class-validator';

const {
  GIFT: { COUNTERPARTY },
} = EXAMPLES;

const {
  VALIDATION: { COUNTERPARTY: VALIDATION },
} = GIFT;

const EXAMPLE = COUNTERPARTY({ withSharePercentage: true }) as {
  counterpartyUrn: string;
  exitDate: string;
  roleCode: string;
  sharePercentage?: number;
  startDate: string;
};

/**
 * GIFT "counterparty" request DTO.
 * These fields are required for APIM to create a "counterparty" in GIFT.
 */
export class GiftFacilityCounterpartyRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.COUNTERPARTY_URN.MIN_LENGTH, VALIDATION.COUNTERPARTY_URN.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.counterpartyUrn,
    required: true,
  })
  counterpartyUrn: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.exitDate,
    required: true,
  })
  exitDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.ROLE_CODE.MIN_LENGTH, VALIDATION.ROLE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.roleCode,
    required: true,
  })
  roleCode: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: EXAMPLE.sharePercentage,
    description: "Required if a counterparty's role's hasSharePercentage field is true",
  })
  sharePercentage?: number;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.startDate,
    required: true,
  })
  startDate: string;
}

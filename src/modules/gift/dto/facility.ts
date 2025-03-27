import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsBoolean, IsNumberString, IsString, Min } from 'class-validator';

const {
  GIFT: { FACILITY },
} = EXAMPLES;

/**
 * GIFT facility DTO.
 * This is a generic/base DTO for a GIFT facility.
 */
export class GiftFacilityDto {
  @IsString()
  @ApiProperty({
    example: FACILITY.CURRENCY,
  })
  currency: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The deal ID',
  })
  @ApiProperty({
    example: FACILITY.DEAL_ID,
  })
  dealId: UkefId;

  @IsString()
  @ApiProperty({
    example: FACILITY.EFFECTIVE_DATE,
  })
  effectiveDate: string;

  @IsString()
  @ApiProperty({
    example: FACILITY.END_OF_COVER_DATE,
  })
  endOfCoverDate: string;

  @IsString()
  @ApiProperty({
    example: FACILITY.EXPIRY_DATE,
  })
  expiryDate: string;

  @Min(0)
  @ApiProperty({
    example: FACILITY.FACILITY_AMOUNT,
  })
  facilityAmount: number;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  @ApiProperty({
    example: FACILITY.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
  })
  facilityId: UkefId;

  @IsBoolean()
  @ApiProperty({
    example: FACILITY.IS_REVOLVING,
  })
  isRevolving: boolean;

  @IsString()
  @ApiProperty({
    example: FACILITY.FACILITY_NAME,
  })
  name: string;

  @IsNumberString()
  @ApiProperty({
    example: FACILITY.OBLIGOR_URN,
  })
  obligorUrn: string;

  @IsString()
  @ApiProperty({
    example: 'Export Insurance Policy (EXIP)',
  })
  productType: string;
}

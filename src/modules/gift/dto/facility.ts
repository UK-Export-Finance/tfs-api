import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsBoolean, IsDefined, IsNumber, IsNumberString, IsString, Length, Min } from 'class-validator';

const {
  GIFT: { FACILITY: EXAMPLE },
} = EXAMPLES;

const {
  VALIDATION: {
    FACILITY: { OVERVIEW: VALIDATION },
  },
} = GIFT;

/**
 * GIFT facility DTO.
 * This is a generic/base DTO for a GIFT facility.
 */
export class GiftFacilityDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN, VALIDATION.CURRENCY.MAX)
  @ApiProperty({
    example: EXAMPLE.CURRENCY,
  })
  currency: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The deal ID',
  })
  @ApiProperty({
    example: EXAMPLE.DEAL_ID,
    minLength: VALIDATION.DEAL_ID.MIN,
    maxLength: VALIDATION.DEAL_ID.MAX,
  })
  dealId: UkefId;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EFFECTIVE_DATE.MIN, VALIDATION.EFFECTIVE_DATE.MAX)
  @ApiProperty({
    example: EXAMPLE.EFFECTIVE_DATE,
  })
  effectiveDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.END_OF_COVER_DATE.MIN, VALIDATION.END_OF_COVER_DATE.MAX)
  @ApiProperty({
    example: EXAMPLE.END_OF_COVER_DATE,
  })
  endOfCoverDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EXPIRY_DATE.MIN, VALIDATION.EXPIRY_DATE.MAX)
  @ApiProperty({
    example: EXAMPLE.EXPIRY_DATE,
  })
  expiryDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.FACILITY_AMOUNT.MIN)
  @ApiProperty({
    example: EXAMPLE.FACILITY_AMOUNT,
  })
  facilityAmount: number;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  @ApiProperty({
    example: EXAMPLE.FACILITY_ID,
    minLength: VALIDATION.FACILITY_ID.MIN,
    maxLength: VALIDATION.FACILITY_ID.MAX,
  })
  facilityId: UkefId;

  @IsDefined()
  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.IS_REVOLVING,
  })
  isRevolving: boolean;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY_NAME.MIN, VALIDATION.FACILITY_NAME.MAX)
  @ApiProperty({
    example: EXAMPLE.FACILITY_NAME,
  })
  name: string;

  @IsDefined()
  @IsNumberString()
  @ApiProperty({
    example: EXAMPLE.OBLIGOR_URN,
  })
  obligorUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.PRODUCT_TYPE.MIN, VALIDATION.PRODUCT_TYPE.MAX)
  @ApiProperty({
    example: 'Export Insurance Policy (EXIP)',
  })
  productType: string;
}

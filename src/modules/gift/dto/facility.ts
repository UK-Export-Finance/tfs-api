import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsBoolean, IsDefined, IsNumber, IsNumberString, IsString, Length, Min } from 'class-validator';

const {
  GIFT: { DEAL_ID, FACILITY_ID, FACILITY_OVERVIEW: EXAMPLE },
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
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.currency,
  })
  currency: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The deal ID',
  })
  @ApiProperty({
    example: DEAL_ID,
    minLength: VALIDATION.DEAL_ID.MIN_LENGTH,
    maxLength: VALIDATION.DEAL_ID.MAX_LENGTH,
  })
  dealId: UkefId;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EFFECTIVE_DATE.MIN_LENGTH, VALIDATION.EFFECTIVE_DATE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.effectiveDate,
  })
  effectiveDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.END_OF_COVER_DATE.MIN_LENGTH, VALIDATION.END_OF_COVER_DATE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.endOfCoverDate,
  })
  endOfCoverDate: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.EXPIRY_DATE.MIN_LENGTH, VALIDATION.EXPIRY_DATE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.expiryDate,
  })
  expiryDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.FACILITY_AMOUNT.MIN)
  @ApiProperty({
    example: EXAMPLE.facilityAmount,
  })
  facilityAmount: number;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  @ApiProperty({
    example: FACILITY_ID,
    minLength: VALIDATION.FACILITY_ID.MIN_LENGTH,
    maxLength: VALIDATION.FACILITY_ID.MAX_LENGTH,
  })
  facilityId: UkefId;

  @IsDefined()
  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.isRevolving,
  })
  isRevolving: boolean;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY_NAME.MIN_LENGTH, VALIDATION.FACILITY_NAME.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.name,
  })
  name: string;

  @IsDefined()
  @IsNumberString()
  @Length(VALIDATION.OBLIGOR_URN.MIN_LENGTH, VALIDATION.OBLIGOR_URN.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.obligorUrn,
  })
  obligorUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.PRODUCT_TYPE_CODE.MIN_LENGTH, VALIDATION.PRODUCT_TYPE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.productTypeCode,
  })
  productTypeCode: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsDateString, IsDefined, IsNumber, IsNumberString, IsString, Length, Max, Min } from 'class-validator';

const {
  GIFT: { FACILITY_ID, FACILITY_OVERVIEW: EXAMPLE },
} = EXAMPLES;

const {
  VALIDATION: {
    FACILITY: { OVERVIEW: VALIDATION },
  },
} = GIFT;

/**
 * GIFT facility overview request DTO.
 * These fields are required for APIM to create a high level facility data in GIFT.
 */
export class GiftFacilityOverviewRequestDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.currency,
    required: true,
  })
  currency: string;

  @IsDefined()
  @IsString()
  @ApiProperty({
    example: EXAMPLE.creditType,
    required: true,
  })
  creditType: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.effectiveDate,
    required: true,
  })
  effectiveDate: string;

  @IsDefined()
  @IsDateString()
  @ApiProperty({
    example: EXAMPLE.expiryDate,
    required: true,
  })
  expiryDate: string;

  @IsDefined()
  @IsNumber()
  @Min(VALIDATION.FACILITY_AMOUNT.MIN)
  @Max(VALIDATION.FACILITY_AMOUNT.MAX)
  @ApiProperty({
    example: EXAMPLE.amount,
    required: true,
  })
  amount: number;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID',
  })
  @ApiProperty({
    example: FACILITY_ID,
    minLength: VALIDATION.FACILITY_ID.MIN_LENGTH,
    maxLength: VALIDATION.FACILITY_ID.MAX_LENGTH,
    required: true,
  })
  facilityId: UkefId;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.FACILITY_NAME.MIN_LENGTH, VALIDATION.FACILITY_NAME.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.name,
    required: true,
  })
  name: string;

  @IsDefined()
  @IsNumberString()
  @Length(VALIDATION.OBLIGOR_URN.MIN_LENGTH, VALIDATION.OBLIGOR_URN.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.obligorUrn,
    required: true,
  })
  obligorUrn: string;

  @IsDefined()
  @IsString()
  @Length(VALIDATION.PRODUCT_TYPE_CODE.MIN_LENGTH, VALIDATION.PRODUCT_TYPE_CODE.MAX_LENGTH)
  @ApiProperty({
    example: EXAMPLE.productTypeCode,
    required: true,
  })
  productTypeCode: string;
}

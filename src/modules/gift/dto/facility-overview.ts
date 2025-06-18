import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';
import { IsBoolean, IsDateString, IsDefined, IsNumber, IsNumberString, IsString, Length, Max, Min } from 'class-validator';

import { IsSupportedCurrency, IsSupportedProductType } from '../custom-decorators';

const {
  GIFT: { DEAL_ID, FACILITY_ID, FACILITY_OVERVIEW: EXAMPLE },
} = EXAMPLES;

const {
  VALIDATION: {
    FACILITY: { OVERVIEW: VALIDATION },
  },
} = GIFT;

/**
 * GIFT facility overview DTO.
 * This is the "overview" data of a GIFT facility.
 */
export class GiftFacilityOverviewDto {
  @IsDefined()
  @IsString()
  @Length(VALIDATION.CURRENCY.MIN_LENGTH, VALIDATION.CURRENCY.MAX_LENGTH)
  @IsSupportedCurrency()
  @ApiProperty({
    example: EXAMPLE.currency,
    required: true,
  })
  currency: string;

  @ValidatedFacilityIdentifierApiProperty({
    description: 'The deal ID',
  })
  @ApiProperty({
    example: DEAL_ID,
    minLength: VALIDATION.DEAL_ID.MIN_LENGTH,
    maxLength: VALIDATION.DEAL_ID.MAX_LENGTH,
    required: true,
  })
  dealId: UkefId;

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
    example: EXAMPLE.endOfCoverDate,
    required: true,
  })
  endOfCoverDate: string;

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
    example: EXAMPLE.facilityAmount,
    required: true,
  })
  facilityAmount: number;

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
  @IsBoolean()
  @ApiProperty({
    example: EXAMPLE.isRevolving,
    required: true,
  })
  isRevolving: boolean;

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
  @IsSupportedProductType()
  @ApiProperty({
    example: EXAMPLE.productTypeCode,
    required: true,
  })
  productTypeCode: string;
}

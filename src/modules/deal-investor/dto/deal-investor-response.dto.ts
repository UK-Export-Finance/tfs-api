import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { ENUMS, EXAMPLES, PROPERTIES } from '@ukef/constants';
import { DateOnlyString } from '@ukef/helpers/date-only-string.type';
import { IsEnum } from 'class-validator';

class DealInvestorDtoLenderType {
  @ApiProperty({ description: 'Lender type: 100 for Exporter or 500 for UKEF record.', example: ENUMS.LENDER_TYPE_CODES.ECGD })
  @IsEnum(ENUMS.LENDER_TYPE_CODES)
  LenderTypeCode: string;
}
export class DealInvestorResponseDto {
  @ApiResponseProperty({ example: EXAMPLES.DEAL_ID })
  dealIdentifier: string;

  @ApiResponseProperty({ example: PROPERTIES.GLOBAL.portfolioIdentifier })
  @IsEnum(ENUMS.PORTFOLIO)
  portfolioIdentifier: string;

  @ApiResponseProperty()
  lenderType: DealInvestorDtoLenderType;

  @ApiProperty({ type: Date, nullable: false })
  effectiveDate: DateOnlyString;

  @ApiProperty({ type: Date, nullable: true })
  expiryDate: DateOnlyString;

  @ApiResponseProperty({ example: false })
  isExpiryDateMaximum: boolean;

  @ApiResponseProperty({ example: 500012.25 })
  maximumLiability: number;
}

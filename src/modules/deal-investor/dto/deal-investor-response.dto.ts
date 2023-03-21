import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { DateString } from '@ukef/helpers/date-string.type';

class DealInvestorDtoLenderType {
  @ApiProperty({ description: 'Lender type: 100 for Exporter or 500 for UKEF record.', example: '500' })
  LenderTypeCode: string;
}
export class DealInvestorResponseDto {
  @ApiResponseProperty({ example: '0030000321' })
  dealIdentifier: string;

  @ApiResponseProperty({ example: 'E1' })
  portfolioIdentifier: string;

  @ApiResponseProperty()
  lenderType: DealInvestorDtoLenderType;

  @ApiProperty({ type: Date, nullable: false })
  effectiveDate: DateString;

  @ApiProperty({ type: Date, nullable: true })
  expiryDate: DateString;

  @ApiResponseProperty({ example: false })
  isExpiryDateMaximum: boolean;

  @ApiResponseProperty({ example: 500012.25 })
  maximumLiability: number;
}

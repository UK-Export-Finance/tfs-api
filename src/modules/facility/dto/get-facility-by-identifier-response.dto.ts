import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { AcbsPartyId, DateOnlyString } from '@ukef/helpers';

export class GetFacilityByIdentifierResponseDto {
  @ApiResponseProperty()
  dealIdentifier: string;

  @ApiResponseProperty()
  facilityIdentifier: string;

  @ApiResponseProperty()
  portfolioIdentifier: string;

  @ApiResponseProperty()
  dealBorrowerIdentifier: string;

  @ApiResponseProperty()
  maximumLiability: number;

  @ApiResponseProperty()
  productTypeId: string;

  @ApiResponseProperty()
  capitalConversionFactorCode: string;

  @ApiResponseProperty()
  currency: string;

  @ApiProperty({ readOnly: true, type: Date, nullable: false, format: 'date' })
  guaranteeCommencementDate: DateOnlyString;

  @ApiProperty({ readOnly: true, type: Date, nullable: false, format: 'date' })
  guaranteeExpiryDate: DateOnlyString;

  @ApiProperty({ readOnly: true, type: Date, nullable: false, format: 'date' })
  nextQuarterEndDate: DateOnlyString;

  @ApiResponseProperty()
  facilityInitialStatus: string;

  @ApiResponseProperty()
  facilityOverallStatus: string;

  @ApiResponseProperty()
  delegationType: string;

  @ApiResponseProperty()
  interestOrFeeRate: number;

  @ApiResponseProperty()
  facilityStageCode: string;

  @ApiResponseProperty()
  exposurePeriod: string;

  @ApiResponseProperty()
  creditRatingCode: string;

  @ApiResponseProperty()
  guaranteePercentage: number;

  @ApiResponseProperty()
  premiumFrequencyCode: string;

  @ApiResponseProperty()
  riskCountryCode: string;

  @ApiResponseProperty()
  riskStatusCode: string;

  @ApiProperty({ readOnly: true, type: Date, nullable: false, format: 'date' })
  effectiveDate: DateOnlyString;

  @ApiResponseProperty()
  forecastPercentage: number;

  @ApiProperty({ readOnly: true, type: Date, nullable: true, format: 'date' })
  issueDate: DateOnlyString | null;

  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  agentBankIdentifier: AcbsPartyId;

  @ApiResponseProperty()
  obligorPartyIdentifier: AcbsPartyId;

  @ApiResponseProperty()
  obligorName: string;

  @ApiResponseProperty()
  obligorIndustryClassification: string;

  @ApiResponseProperty()
  probabilityOfDefault: number;
}

import { Controller, Get, Param } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

import { GetFacilityByIdentifierParamsDto } from './dto/get-facility-by-identifier-params.dto';
import { GetFacilityByIdentifierResponseDto } from './dto/get-facility-by-identifier-response.dto';
import { FacilityService } from './facility.service';

@Controller('facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get(':facilityIdentifier')
  @ApiOperation({ summary: 'Get the facility matching the specified facility identifier.' })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiOkResponse({
    description: 'The facility has been successfully retrieved.',
    type: GetFacilityByIdentifierResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The specified facility was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getFacilityByIdentifier(@Param() params: GetFacilityByIdentifierParamsDto): Promise<GetFacilityByIdentifierResponseDto> {
    const facility = await this.facilityService.getFacilityByIdentifier(params.facilityIdentifier);
    return {
      dealIdentifier: facility.dealIdentifier,
      facilityIdentifier: facility.facilityIdentifier,
      portfolioIdentifier: facility.portfolioIdentifier,
      dealBorrowerIdentifier: facility.dealBorrowerIdentifier,
      maximumLiability: facility.maximumLiability,
      productTypeId: facility.productTypeId,
      capitalConversionFactorCode: facility.capitalConversionFactorCode,
      currency: facility.currency,
      guaranteeCommencementDate: facility.guaranteeCommencementDate,
      guaranteeExpiryDate: facility.guaranteeExpiryDate,
      nextQuarterEndDate: facility.nextQuarterEndDate,
      facilityInitialStatus: facility.facilityInitialStatus,
      facilityOverallStatus: facility.facilityOverallStatus,
      delegationType: facility.delegationType,
      interestOrFeeRate: facility.interestOrFeeRate,
      facilityStageCode: facility.facilityStageCode,
      exposurePeriod: facility.exposurePeriod,
      creditRatingCode: facility.creditRatingCode,
      guaranteePercentage: facility.guaranteePercentage,
      premiumFrequencyCode: facility.premiumFrequencyCode,
      riskCountryCode: facility.riskCountryCode,
      riskStatusCode: facility.riskStatusCode,
      effectiveDate: facility.effectiveDate,
      foreCastPercentage: facility.foreCastPercentage,
      issueDate: facility.issueDate,
      description: facility.description,
      agentBankIdentifier: facility.agentBankIdentifier,
      obligorPartyIdentifier: facility.obligorPartyIdentifier,
      obligorName: facility.obligorName,
      obligorIndustryClassification: facility.obligorIndustryClassification,
      probabilityOfDefault: facility.probabilityOfDefault,
    };
  }
}

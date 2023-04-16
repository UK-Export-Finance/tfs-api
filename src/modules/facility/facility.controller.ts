import { Body, Controller, Get, Param, ParseArrayPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

import { CreateFacilityRequest, CreateFacilityRequestItem } from './dto/create-facility-request.dto';
import { CreateFacilityResponse } from './dto/create-facility-response.dto';
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

  @Post()
  @ApiOperation({ summary: 'Create a new facility.' })
  @ApiBody({
    type: CreateFacilityRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The facility has been successfully created.',
    type: CreateFacilityResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createFacility(
    @Body(new ParseArrayPipe({ items: CreateFacilityRequestItem })) createFacilityDto: CreateFacilityRequest,
  ): Promise<CreateFacilityResponse> {
    const facilityToCreate = createFacilityDto[0];
    await this.facilityService.createFacility(facilityToCreate);
    return { facilityIdentifier: facilityToCreate.facilityIdentifier };
  }
}

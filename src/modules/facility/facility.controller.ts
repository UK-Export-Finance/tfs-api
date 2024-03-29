import { Body, Controller, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  refs,
} from '@nestjs/swagger';
import { ENUMS, EXAMPLES } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { WithWarningErrors } from '@ukef/helpers';
import { WarningErrorsHeaderInterceptor } from '@ukef/interceptors/warning-errors-header.interceptor';
import { CreateFacilityRequest, CreateFacilityRequestItem } from '@ukef/modules/facility/dto/create-facility-request.dto';
import { CreateFacilityResponse } from '@ukef/modules/facility/dto/create-facility-response.dto';
import { GetFacilityByIdentifierParamsDto } from '@ukef/modules/facility/dto/get-facility-by-identifier-params.dto';
import { GetFacilityByIdentifierResponseDto } from '@ukef/modules/facility/dto/get-facility-by-identifier-response.dto';
import { UpdateFacilityByOperationParamsDto } from '@ukef/modules/facility/dto/update-facility-by-operation-params.dto';
import { UpdateFacilityByOperationQueryDto } from '@ukef/modules/facility/dto/update-facility-by-operation-query.dto';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse, UpdateFacilityFacilityIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';
import { FacilityService } from '@ukef/modules/facility/facility.service';

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
      forecastPercentage: facility.forecastPercentage,
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
  async createFacility(@ValidatedArrayBody({ items: CreateFacilityRequestItem }) createFacilityDto: CreateFacilityRequest): Promise<CreateFacilityResponse> {
    const [facilityToCreate] = createFacilityDto;
    await this.facilityService.createFacility(facilityToCreate);
    return { facilityIdentifier: facilityToCreate.facilityIdentifier };
  }

  @Put(':facilityIdentifier')
  @UseInterceptors(WarningErrorsHeaderInterceptor)
  @ApiOperation({ summary: 'Update a facility by facility identifier and operation enum query' })
  @ApiBody({ type: UpdateFacilityRequest })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiExtraModels(UpdateFacilityFacilityIdentifierResponse, UpdateFacilityBundleIdentifierResponse)
  @ApiOkResponse({
    description:
      'The facility has been successfully updated.\n\n`issue` and `amendExpiryDate` ops returns `UpdateFacilityFacilityIdentifierResponse`.\n\n`amendAmount` op returns `UpdateFacilityBundleIdentifierResponse',
    content: {
      'application/json': {
        schema: {
          oneOf: refs(UpdateFacilityFacilityIdentifierResponse, UpdateFacilityBundleIdentifierResponse),
        },
        examples: {
          'issue and amendExpiryDate': { value: { facilityIdentifier: EXAMPLES.ACBS_BUNDLE_ID } },
          amendAmount: { value: { bundleIdentifier: EXAMPLES.ACBS_BUNDLE_ID } },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'The specified facility was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async updateFacilityByOperation(
    @Query() query: UpdateFacilityByOperationQueryDto,
    @Param() params: UpdateFacilityByOperationParamsDto,
    @Body() updateFacilityDto: UpdateFacilityRequest,
  ): Promise<UpdateFacilityFacilityIdentifierResponse | WithWarningErrors<UpdateFacilityBundleIdentifierResponse>> {
    if (query.op === ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE) {
      await this.facilityService.issueFacilityByIdentifier(params.facilityIdentifier, updateFacilityDto);
      return { facilityIdentifier: params.facilityIdentifier };
    }
    if (query.op === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE) {
      await this.facilityService.amendFacilityExpiryDateByIdentifier(params.facilityIdentifier, updateFacilityDto);
      return { facilityIdentifier: params.facilityIdentifier };
    }
    if (query.op === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT) {
      return this.facilityService.amendFacilityAmountByIdentifier(params.facilityIdentifier, updateFacilityDto);
    }
  }
}

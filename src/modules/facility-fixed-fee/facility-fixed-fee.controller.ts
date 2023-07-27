import { Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
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
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { CreateBundleInformationErrorInterceptor } from '@ukef/interceptors/create-bundle-information-error.interceptor';
import { FacilityService } from '@ukef/modules/facility/facility.service';

import { CreateFixedFeeAmountAmendmentRequest, CreateFixedFeeAmountAmendmentRequestItem } from './dto/create-facility-fixed-fee-amount-amendment-request.dto';
import { CreateFixedFeeAmountAmendmentResponse } from './dto/create-facility-fixed-fee-amount-amendment-response.dto';
import { CreateFacilityFixedFeeRequest, CreateFacilityFixedFeeRequestItem } from './dto/create-facility-fixed-fee-request.dto';
import { CreateFacilityFixedFeeResponse } from './dto/create-facility-fixed-fee-response.dto';
import { FacilityFixedFeeParamsDto } from './dto/facility-fixed-fee-params.dto';
import { GetFacilityFixedFeeResponse, GetFacilityFixedFeeResponseItem } from './dto/get-facility-fixed-fee-response.dto';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Controller()
export class FacilityFixedFeeController {
  constructor(private readonly facilityFixedFeeService: FacilityFixedFeeService, private readonly facilityService: FacilityService) {}
  @Get('/facilities/:facilityIdentifier/fixed-fees')
  @ApiOperation({
    summary: 'Get all fixed fees for a facility.',
  })
  @ApiOkResponse({
    description: 'The fixed fees for the facility have been successfully retrieved.',
    type: GetFacilityFixedFeeResponseItem,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getFixedFeesForFacility(@Param() params: FacilityFixedFeeParamsDto): Promise<GetFacilityFixedFeeResponse> {
    return this.facilityFixedFeeService.getFixedFeesForFacility(params.facilityIdentifier);
  }

  @Post('/facilities/:facilityIdentifier/fixed-fees/amendments/amount')
  @UseInterceptors(CreateBundleInformationErrorInterceptor)
  @ApiOperation({
    summary: 'Create a fixed fees amount amendment bundle.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFixedFeeAmountAmendmentRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The fixed fees amount amendment bundle has been successfully created.',
    type: CreateFixedFeeAmountAmendmentResponse,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createAmountAmendmentForFixedFees(
    @Param() params: FacilityFixedFeeParamsDto,
    @ValidatedArrayBody({ items: CreateFixedFeeAmountAmendmentRequestItem }) newFixedFeeAmountAmendmentRequest: CreateFixedFeeAmountAmendmentRequest,
  ): Promise<CreateFixedFeeAmountAmendmentResponse> {
    return await this.facilityFixedFeeService.createAmountAmendmentForFixedFees(params.facilityIdentifier, newFixedFeeAmountAmendmentRequest);
  }

  @Post('facilities/:facilityIdentifier/fixed-fees')
  @ApiOperation({
    summary: 'Create a new fixed fee for a facility.',
  })
  @ApiBody({
    type: CreateFacilityFixedFeeRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The fixed fee has been successfully created.',
    type: CreateFacilityFixedFeeResponse,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createFixedFeeForFacility(
    @Param() params: FacilityFixedFeeParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityFixedFeeRequestItem }) newCreateFacilityFixedFeeRequest: CreateFacilityFixedFeeRequest,
  ): Promise<CreateFacilityFixedFeeResponse> {
    const { facilityIdentifier } = params;
    const facility = await this.facilityService.getFacilityByIdentifier(facilityIdentifier);

    const [newCreateFacilityFixedFee] = newCreateFacilityFixedFeeRequest;

    await this.facilityFixedFeeService.createFixedFeeForFacility(
      facilityIdentifier,
      facility.obligorPartyIdentifier,
      facility.productTypeId,
      newCreateFacilityFixedFee,
      facility.facilityOverallStatus,
      facility.facilityStageCode,
    );

    return new CreateFacilityFixedFeeResponse(facilityIdentifier);
  }
}

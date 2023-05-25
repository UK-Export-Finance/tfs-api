import { Controller, Get, Param, Post } from '@nestjs/common';
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

import { GetFacilityFixedFeeParamsDto } from './dto/get-facility-fixed-fee-params.dto';
import { GetFacilityFixedFeeResponse, GetFacilityFixedFeeResponseItem } from './dto/get-facility-fixed-fee-response.dto';
import { FacilityFixedFeeService } from './facility-fixed-fee.service';

@Controller()
export class FacilityFixedFeeController {
  constructor(private readonly facilityFixedFeeService: FacilityFixedFeeService) {}
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
  async getFixedFeesForFacility(@Param() params: GetFacilityFixedFeeParamsDto): Promise<GetFacilityFixedFeeResponse> {
    return await this.facilityFixedFeeService.getFixedFeesForFacility(params.facilityIdentifier);
  }

  @Post('/facilities/:facilityIdentifier/fixed-fees/amendments/amount')
  @ApiOperation({
    summary: 'Create a fixed fees amount amendment bundle.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS. Note that this endpoint does not check that the loan belongs to this facility.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFixedFeeAmountAmendmentRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The loan amount amendment bundle has been successfully created.',
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
  async createAmountAmendmentForLoan(
    @Param() params: CreateLoanAmountAmendmentParams,
    @ValidatedArrayBody({ items: CreateLoanAmountAmendmentRequestItem }) newLoanAmountAmendmentRequest: CreateLoanAmountAmendmentRequest,
  ): Promise<CreateLoanAmountAmendmentResponse> {
    const [newLoanAmountAmendment] = newLoanAmountAmendmentRequest;
    const createdBundleIdentifier = await this.facilityLoanService.createAmountAmendmentForLoan(params.loanIdentifier, newLoanAmountAmendment);
    return { bundleIdentifier: createdBundleIdentifier };
  }
}

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
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { CreateFacilityLoanRequest, CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponse } from './dto/create-facility-loan-response.dto';
import { CreateLoanAmountAmendmentParams } from './dto/create-loan-amount-amendment-params.dto';
import { CreateLoanAmountAmendmentRequest, CreateLoanAmountAmendmentRequestItem } from './dto/create-loan-amount-amendment-request.dto';
import { CreateLoanAmountAmendmentResponse } from './dto/create-loan-amount-amendment-response.dto';
import { FacilityLoanParamsDto } from './dto/facility-loan-params.dto';
import { GetFacilityLoanResponseDto, GetFacilityLoanResponseItem } from './dto/get-facility-loan-response.dto';
import { FacilityLoanService } from './facility-loan.service';

@Controller()
export class FacilityLoanController {
  constructor(private readonly facilityLoanService: FacilityLoanService) {}

  @Get('/facilities/:facilityIdentifier/loans')
  @ApiOperation({
    summary: 'Get all loans for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiOkResponse({
    description: 'The loans for the facility have been retrieved.',
    type: GetFacilityLoanResponseItem,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'The facility was not found.',
  })
  @ApiBadRequestResponse({
    description: 'The specified facilityIdentifier is not valid.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getLoansForFacility(@Param() params: FacilityLoanParamsDto): Promise<GetFacilityLoanResponseDto> {
    return await this.facilityLoanService.getLoansForFacility(params.facilityIdentifier);
  }

  @Post('facilities/:facilityIdentifier/loans')
  @ApiOperation({
    summary: 'Create a new loan for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFacilityLoanRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The loan has been successfully created.',
    type: CreateFacilityLoanResponse,
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
  createLoanForFacility(
    @Param() params: FacilityLoanParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityLoanRequestItem }) newLoanRequest: CreateFacilityLoanRequest,
  ): Promise<CreateFacilityLoanResponse> {
    const { facilityIdentifier } = params;
    const [newLoan] = newLoanRequest;

    return this.facilityLoanService.createLoanForFacility(facilityIdentifier, newLoan);
  }

  @Post('/facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount')
  @ApiOperation({
    summary: 'Create a loan amount amendment bundle.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS. Note that this endpoint does not check that the loan belongs to this facility.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiParam({
    name: 'loanIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the loan in ACBS.',
    example: EXAMPLES.LOAN_ID,
  })
  @ApiBody({
    type: CreateLoanAmountAmendmentRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The loan amount amendment bundle has been successfully created.',
    type: CreateLoanAmountAmendmentResponse,
  })
  @ApiNotFoundResponse({
    description: 'The loan was not found.',
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

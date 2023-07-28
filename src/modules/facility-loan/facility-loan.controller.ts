import { Body, Controller, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
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
import { WithWarningErrors } from '@ukef/helpers';
import { WarningErrorsHeaderInterceptor } from '@ukef/interceptors/warning-errors-header.interceptor';

import { CreateFacilityLoanRequest, CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponse } from './dto/create-facility-loan-response.dto';
import { CreateLoanAmountAmendmentParams } from './dto/create-loan-amount-amendment-params.dto';
import { CreateLoanAmountAmendmentRequest, CreateLoanAmountAmendmentRequestItem } from './dto/create-loan-amount-amendment-request.dto';
import { CreateLoanAmountAmendmentResponse } from './dto/create-loan-amount-amendment-response.dto';
import { FacilityLoanParamsDto } from './dto/facility-loan-params.dto';
import { GetFacilityLoanResponseDto, GetFacilityLoanResponseItem } from './dto/get-facility-loan-response.dto';
import { UpdateLoanExpiryDateParamsDto } from './dto/update-loan-expiry-date-params.dto';
import { UpdateLoanExpiryDateRequest } from './dto/update-loan-expiry-date-request.dto';
import { UpdateLoanExpiryDateResponse } from './dto/update-loan-expiry-date-response.dto';
import { FacilityLoanService } from './facility-loan.service';

@Controller()
export class FacilityLoanController {
  constructor(private readonly facilityLoanService: FacilityLoanService) {}

  @Get('/facilities/:facilityIdentifier/loans')
  @ApiOperation({
    summary: 'Get all loans for a facility.',
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
  @UseInterceptors(WarningErrorsHeaderInterceptor)
  @ApiOperation({
    summary: 'Create a new loan for a facility.',
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
  ): Promise<WithWarningErrors<CreateFacilityLoanResponse>> {
    const { facilityIdentifier } = params;
    const [newLoan] = newLoanRequest;

    return this.facilityLoanService.createLoanForFacility(facilityIdentifier, newLoan);
  }

  @Patch('facilities/:facilityIdentifier/loans/:loanIdentifier')
  @ApiOperation({
    summary: "Update an existing loan's expiry date.",
  })
  @ApiBody({
    type: UpdateLoanExpiryDateRequest,
  })
  @ApiOkResponse({
    description: 'The loan has been updated',
    type: UpdateLoanExpiryDateResponse,
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
  async updateLoanExpiryDate(
    @Param() params: UpdateLoanExpiryDateParamsDto,
    @Body() updateLoanExpiryDateRequest: UpdateLoanExpiryDateRequest,
  ): Promise<UpdateLoanExpiryDateResponse> {
    const { loanIdentifier } = params;
    await this.facilityLoanService.updateLoanExpiryDate(loanIdentifier, updateLoanExpiryDateRequest);
    return { loanIdentifier };
  }

  @Post('/facilities/:facilityIdentifier/loans/:loanIdentifier/amendments/amount')
  @UseInterceptors(WarningErrorsHeaderInterceptor)
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
  createAmountAmendmentForLoan(
    @Param() params: CreateLoanAmountAmendmentParams,
    @ValidatedArrayBody({ items: CreateLoanAmountAmendmentRequestItem }) newLoanAmountAmendmentRequest: CreateLoanAmountAmendmentRequest,
  ): Promise<WithWarningErrors<CreateLoanAmountAmendmentResponse>> {
    const [newLoanAmountAmendment] = newLoanAmountAmendmentRequest;
    return this.facilityLoanService.createAmountAmendmentForLoan(params.loanIdentifier, newLoanAmountAmendment);
  }
}

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

import { CreateFacilityLoanRequestDto, CreateFacilityLoanRequestItem } from './dto/create-facility-loan-request.dto';
import { CreateFacilityLoanResponseDto } from './dto/create-facility-loan-response.dto';
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
    description: 'The covenant has been successfully created.',
    type: CreateFacilityLoanResponseDto,
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
  async createLoanForFacility(
    @Param() params: FacilityLoanParamsDto,
    @Body(new ParseArrayPipe({ items: CreateFacilityLoanRequestItem, whitelist: true })) newLoanRequest: CreateFacilityLoanRequestDto,
  ): Promise<CreateFacilityLoanResponseDto> {
    const facilityIdentifier = params.facilityIdentifier;
    const newLoan = newLoanRequest[0];

    return await this.facilityLoanService.createLoanForFacility(facilityIdentifier, newLoan);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

import { GetLoanTransactionParamsDto } from './dto/get-facility-loan-transaction-params.dto';
import { GetFacilityLoanTransactionResponseDto } from './dto/get-facility-loan-transaction-response.dto';
import { FacilityLoanTransactionService } from './facility-loan-transaction.service';

@Controller()
export class FacilityLoanTransactionController {
  constructor(private readonly facilityLoanTransactionService: FacilityLoanTransactionService) {}

  @Get('facilities/:facilityIdentifier/loan-transactions/:bundleIdentifier')
  @ApiOperation({ summary: 'Get the loan transaction matching the specified bundle identifier.' })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiParam({
    name: 'bundleIdentifier',
    required: true,
    type: 'string',
    description: 'The bundle identifier of the loan transaction in ACBS.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  @ApiOkResponse({
    description: 'The loan transaction has been successfully retrieved.',
    type: GetFacilityLoanTransactionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The specified loan transaction was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getLoanTransactionByBundleIdentifier(@Param() params: GetLoanTransactionParamsDto): Promise<GetFacilityLoanTransactionResponseDto> {
    return this.facilityLoanTransactionService.getLoanTransactionsByBundleIdentifier(params.bundleIdentifier);
  }
}

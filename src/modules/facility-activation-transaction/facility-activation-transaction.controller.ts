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
import { WithWarningErrors } from '@ukef/helpers/with-warning-errors.type';
import { WarningErrorsHeaderInterceptor } from '@ukef/interceptors/warning-errors-header.interceptor';
import { FacilityService } from '@ukef/modules/facility/facility.service';

import {
  CreateFacilityActivationTransactionRequest,
  CreateFacilityActivationTransactionRequestItem,
} from './dto/create-facility-activation-transaction-request.dto';
import { CreateFacilityActivationTransactionResponse } from './dto/create-facility-activation-transaction-response.dto';
import { FacilityActivationTransactionParamsDto } from './dto/facility-activation-transaction-params.dto';
import { GetFacilityActivationTransactionParamsDto } from './dto/get-facility-activation-transaction-params.dto';
import { GetFacilityActivationTransactionResponseDto } from './dto/get-facility-activation-transaction-response.dto';
import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

@Controller()
export class FacilityActivationTransactionController {
  constructor(private readonly facilityActivationTransactionService: FacilityActivationTransactionService, private readonly facilityService: FacilityService) {}

  @Post('facilities/:facilityIdentifier/activation-transactions')
  @UseInterceptors(WarningErrorsHeaderInterceptor)
  @ApiOperation({
    summary: 'Create a new activation transaction for a facility.',
  })
  @ApiParam({
    name: 'facilityIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the facility in ACBS.',
    example: EXAMPLES.FACILITY_ID,
  })
  @ApiBody({
    type: CreateFacilityActivationTransactionRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The activation transaction has been successfully created.',
    type: CreateFacilityActivationTransactionResponse,
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
  async createActivationTransactionForFacility(
    @Param() params: FacilityActivationTransactionParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityActivationTransactionRequestItem })
    newFacilityActivationTransactionRequest: CreateFacilityActivationTransactionRequest,
  ): Promise<WithWarningErrors<CreateFacilityActivationTransactionResponse>> {
    const facility = await this.facilityService.getFacilityByIdentifier(params.facilityIdentifier);

    const [newFacilityActivationTransaction] = newFacilityActivationTransactionRequest;

    return this.facilityActivationTransactionService.createActivationTransactionForFacility(
      params.facilityIdentifier,
      facility.obligorPartyIdentifier,
      facility.effectiveDate,
      newFacilityActivationTransaction,
    );
  }

  @Get('facilities/:facilityIdentifier/activation-transactions/:bundleIdentifier')
  @ApiOperation({ summary: 'Get the activation transaction matching the specified bundle identifier.' })
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
    description: 'The bundle identifier of the activation transaction in ACBS.',
    example: EXAMPLES.ACBS_BUNDLE_ID,
  })
  @ApiOkResponse({
    description: 'The activation transaction has been successfully retrieved.',
    type: GetFacilityActivationTransactionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The specified activation transaction was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getActivationTransactionByBundleIdentifier(@Param() params: GetFacilityActivationTransactionParamsDto): Promise<GetFacilityActivationTransactionResponseDto> {
    return this.facilityActivationTransactionService.getActivationTransactionByBundleIdentifier(params.bundleIdentifier);
  }
}

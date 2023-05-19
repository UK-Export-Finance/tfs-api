import { Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { FacilityService } from '@ukef/modules/facility/facility.service';

import {
  CreateFacilityActivationTransactionRequest,
  CreateFacilityActivationTransactionRequestItem,
} from './dto/create-facility-activation-transaction-request.dto';
import { CreateFacilityActivationTransactionResponse } from './dto/create-facility-activation-transaction-response.dto';
import { FacilityActivationTransactionParamsDto } from './dto/facility-activation-transaction-params.dto';
import { FacilityActivationTransactionService } from './facility-activation-transaction.service';

@Controller()
export class FacilityActivationTransactionController {
  constructor(private readonly facilityActivationTransactionService: FacilityActivationTransactionService, private readonly facilityService: FacilityService) {}

  @Post('facilities/:facilityIdentifier/activation-transactions')
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
  ): Promise<CreateFacilityActivationTransactionResponse> {
    const facility = await this.facilityService.getFacilityByIdentifier(params.facilityIdentifier);

    const newFacilityActivationTransaction = newFacilityActivationTransactionRequest[0];

    return this.facilityActivationTransactionService.createActivationTransactionForFacility(
      params.facilityIdentifier,
      facility.obligorPartyIdentifier,
      facility.effectiveDate,
      newFacilityActivationTransaction,
    );
  }
}

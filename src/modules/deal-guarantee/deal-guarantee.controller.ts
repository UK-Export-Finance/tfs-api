import { Body, Controller, Param, ParseArrayPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { DealGuaranteeService } from './deal-guarantee.service';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';
import { CreateDealGuaranteeRequest, CreateDealGuaranteeRequestItem } from './dto/create-deal-guarantee-request.dto';
import { CreateDealGuaranteeResponse } from './dto/create-deal-guarantee-response.dto';

@Controller()
export class DealGuaranteeController {
  constructor(private readonly dealGuaranteeService: DealGuaranteeService) {}

  @Post('deals/:dealIdentifier/guarantees')
  @ApiOperation({
    summary: 'Create a new guarantee for a deal.',
  })
  @ApiParam({
    name: 'dealIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the deal in ACBS.',
    example: '00000001',
  })
  @ApiBody({
    type: CreateDealGuaranteeRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The guarantee has been successfully created.',
    type: CreateDealGuaranteeResponse,
  })
  @ApiNotFoundResponse({
    description: 'The deal was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createGuaranteeForDeal(
    @Param('dealIdentifier') dealIdentifier: string,
    @Body(new ParseArrayPipe({ items: CreateDealGuaranteeRequestItem })) newGuaranteeRequest: CreateDealGuaranteeRequest,
  ): Promise<CreateDealGuaranteeResponse> {
    const newGuarantee = newGuaranteeRequest[0];
    const guaranteeToCreate: DealGuaranteeToCreate = {
      dealIdentifier: newGuarantee.dealIdentifier,
      effectiveDate: newGuarantee.effectiveDate,
      limitKey: newGuarantee.limitKey,
      guaranteeExpiryDate: newGuarantee.guaranteeExpiryDate,
      maximumLiability: newGuarantee.maximumLiability,
      guarantorParty: newGuarantee.guarantorParty,
      guaranteeTypeCode: newGuarantee.guaranteeTypeCode,
    };
    await this.dealGuaranteeService.createGuaranteeForDeal(dealIdentifier, guaranteeToCreate);
    return new CreateDealGuaranteeResponse(dealIdentifier);
  }
}

import { Body, Controller, Get, Param, ParseArrayPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { UkefId } from '@ukef/helpers';

import { DealGuaranteeService } from './deal-guarantee.service';
import { DealGuaranteeToCreate } from './deal-guarantee-to-create.interface';
import { CreateDealGuaranteeRequest, CreateDealGuaranteeRequestItem } from './dto/create-deal-guarantee-request.dto';
import { CreateDealGuaranteeResponse } from './dto/create-deal-guarantee-response.dto';
import { GetDealsGuaranteesParamsDto } from './dto/get-deal-guarantee-params.dto';
import { GetDealGuaranteeResponse, GetDealGuaranteeResponseItem } from './dto/get-deal-guarantee-response.dto';

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
    example: EXAMPLES.DEAL_ID,
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
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async createGuaranteeForDeal(
    @Param('dealIdentifier') dealIdentifier: UkefId,
    @Body(new ParseArrayPipe({ items: CreateDealGuaranteeRequestItem, whitelist: true })) newGuaranteeRequest: CreateDealGuaranteeRequest,
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

  @Get('deals/:dealIdentifier/guarantees')
  @ApiOperation({
    summary: 'Get all guarantees for a specific deal.',
  })
  @ApiOkResponse({
    description: 'The deal guarantees have been successfully retrieved.',
    type: GetDealGuaranteeResponseItem,
    isArray: true,
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
  getGuaranteesForDeal(@Param() params: GetDealsGuaranteesParamsDto): Promise<GetDealGuaranteeResponse> {
    return this.dealGuaranteeService.getGuaranteesForDeal(params.dealIdentifier);
  }
}

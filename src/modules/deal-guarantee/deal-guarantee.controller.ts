import { Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { UkefId } from '@ukef/helpers';

import { DealGuaranteeService } from './deal-guarantee.service';
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
    @ValidatedArrayBody({ items: CreateDealGuaranteeRequestItem }) newGuaranteeRequest: CreateDealGuaranteeRequest,
  ): Promise<CreateDealGuaranteeResponse> {
    const [newGuarantee] = newGuaranteeRequest;
    await this.dealGuaranteeService.createGuaranteeForDeal(dealIdentifier, newGuarantee);
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

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

import { DealService } from './deal.service';
import { DealToCreate } from './deal-to-create.interface';
import { CreateDealRequest, CreateDealRequestItem } from './dto/create-deal-request.dto';
import { CreateDealResponse } from './dto/create-deal-response.dto';
import { GetDealByIdentifierResponse } from './dto/get-deal-by-identifier-response.dto';

@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Get(':dealIdentifier')
  @ApiOperation({ summary: 'Get the deal matching the specified deal identifier.' })
  @ApiParam({
    name: 'dealIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the deal in ACBS.',
    example: EXAMPLES.DEAL_ID,
  })
  @ApiOkResponse({
    description: 'The deal has been successfully retrieved.',
    type: GetDealByIdentifierResponse,
  })
  @ApiNotFoundResponse({
    description: 'The specified deal was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getDealByIdentifier(@Param('dealIdentifier') dealIdentifier: string): Promise<GetDealByIdentifierResponse> {
    const deal = await this.dealService.getDealByIdentifier(dealIdentifier);
    return {
      dealIdentifier: deal.dealIdentifier,
      portfolioIdentifier: deal.portfolioIdentifier,
      currency: deal.currency,
      dealValue: deal.dealValue,
      guaranteeCommencementDate: deal.guaranteeCommencementDate,
      obligorPartyIdentifier: deal.obligorPartyIdentifier,
      obligorName: deal.obligorName,
      obligorIndustryClassification: deal.obligorIndustryClassification,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Creates a new deal.' })
  @ApiBody({
    type: CreateDealRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The deal has been successfully created.',
    type: CreateDealResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createDeal(@ValidatedArrayBody({ items: CreateDealRequestItem }) createDealDto: CreateDealRequest): Promise<CreateDealResponse> {
    const [newDeal] = createDealDto;
    const dealToCreate: DealToCreate = {
      dealIdentifier: newDeal.dealIdentifier,
      currency: newDeal.currency,
      dealValue: newDeal.dealValue,
      guaranteeCommencementDate: newDeal.guaranteeCommencementDate,
      obligorPartyIdentifier: newDeal.obligorPartyIdentifier,
      obligorName: newDeal.obligorName,
      obligorIndustryClassification: newDeal.obligorIndustryClassification,
    };
    await this.dealService.createDeal(dealToCreate);
    return new CreateDealResponse(newDeal.dealIdentifier);
  }
}

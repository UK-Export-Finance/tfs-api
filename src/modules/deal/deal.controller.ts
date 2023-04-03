import { Body, Controller, ParseArrayPipe, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation } from '@nestjs/swagger';

import { DealService } from './deal.service';
import { DealToCreate } from './deal-to-create.interface';
import { CreateDealRequest, CreateDealRequestItem } from './dto/create-deal-request.dto';
import { CreateDealResponse } from './dto/create-deal-response.dto';

@Controller('deals')
export class DealController {
  constructor(private readonly dealsService: DealService) {}

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
  async createDeal(@Body(new ParseArrayPipe({ items: CreateDealRequestItem })) createDealDto: CreateDealRequest): Promise<CreateDealResponse> {
    const newDeal = createDealDto[0];
    const dealToCreate: DealToCreate = {
      dealIdentifier: newDeal.dealIdentifier,
      currency: newDeal.currency,
      dealValue: newDeal.dealValue,
      guaranteeCommencementDate: newDeal.guaranteeCommencementDate,
      obligorPartyIdentifier: newDeal.obligorPartyIdentifier,
      obligorName: newDeal.obligorName,
      obligorIndustryClassification: newDeal.obligorIndustryClassification,
    };
    await this.dealsService.createDeal(dealToCreate);
    return new CreateDealResponse(newDeal.dealIdentifier);
  }
}

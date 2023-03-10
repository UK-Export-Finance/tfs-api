import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation } from '@nestjs/swagger';

import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/deals-request.dto';
import { CreateDealResponse } from './dto/deals-response.dto';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new deal' })
  @ApiCreatedResponse({
    description: 'A deal has been successfully created',
    type: CreateDealResponse,
    isArray: false,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred',
  })
  async createDeal(@Body() createDealDto: CreateDealDto): Promise<CreateDealResponse> {
    const { headers } = await this.dealsService.createDeal(createDealDto);
    // The createDeal call will return the location as a header, which we can then truncate the get the deal identifier
    // The header value will look something like '/Portfolio/E1/Deal/0030596647', where the dealIdentifier is '0030596647'
    // const dealIdentifier = headers['location']
    return { dealIdentifier: createDealDto.dealIdentifier };
    // Comment on the PR: is it okay to use the value in the request body as opposed to what is returned in the location header
  }
}

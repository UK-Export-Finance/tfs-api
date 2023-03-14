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
    await this.dealsService.createDeal(createDealDto);
    return { dealIdentifier: createDealDto.dealIdentifier };
  }
}

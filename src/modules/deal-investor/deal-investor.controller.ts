import { Body, Controller, Get, Param, ParseArrayPipe, Post } from '@nestjs/common';
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

import { DealInvestorService } from './deal-investor.service';
import { CreateDealInvestorRequest, CreateDealInvestorRequestItem } from './dto/create-deal-investor-request.dto';
import { CreateDealInvestorResponse } from './dto/create-deal-investor-response.dto';
import { GetDealInvestorResponseDto } from './dto/deal-investor-response.dto';
import { GetDealsInvestorsParamsDto } from './dto/get-deals-investors-params.dto';

@Controller()
export class DealInvestorController {
  constructor(private readonly dealInvestorService: DealInvestorService) {}

  @Get('deals/:dealIdentifier/investors')
  @ApiOperation({
    summary: 'Get all investors of specific deal.',
  })
  @ApiOkResponse({
    description: 'The deal investors have been successfully retrieved.',
    type: GetDealInvestorResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'The specified deal, or the investors for that deal, were not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getDealInvestors(@Param() params: GetDealsInvestorsParamsDto): Promise<GetDealInvestorResponseDto[]> {
    return this.dealInvestorService.getDealInvestors(params.dealIdentifier);
  }

  @Post('deals/:dealIdentifier/investors')
  @ApiOperation({
    summary: 'Create a new investor for a deal.',
  })
  @ApiParam({
    name: 'dealIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the deal in ACBS.',
    example: '0020900111',
  })
  @ApiBody({
    type: CreateDealInvestorRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: 'The investor has been successfully created.',
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
  async createInvestorForDeal(
    @Param('dealIdentifier') dealIdentifier: string,
    @Body(new ParseArrayPipe({ items: CreateDealInvestorRequestItem })) newInvestorRequest: CreateDealInvestorRequest,
  ): Promise<CreateDealInvestorResponse> {
    const newInvestor = newInvestorRequest[0];
    const investorToCreate: CreateDealInvestorRequestItem = {
      dealIdentifier: newInvestor.dealIdentifier,
      lenderType: newInvestor.lenderType,
      effectiveDate: newInvestor.effectiveDate,
      expiryDate: newInvestor.expiryDate,
      dealStatus: newInvestor.dealStatus,
      currency: newInvestor.currency,
    };
    await this.dealInvestorService.createInvestorForDeal(dealIdentifier, investorToCreate);
    return new CreateDealInvestorResponse(dealIdentifier);
  }
}

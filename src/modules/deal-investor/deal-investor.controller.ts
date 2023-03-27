import { Controller, Get, Param } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { DealInvestorService } from './deal-investor.service';
import { DealInvestorResponseDto } from './dto/deal-investor-response.dto';
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
    type: DealInvestorResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'The specified deal, or the investors for that deal, were not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getDealInvestors(@Param() params: GetDealsInvestorsParamsDto): Promise<DealInvestorResponseDto[]> {
    return this.dealInvestorService.getDealInvestors(params.dealIdentifier);
  }
}

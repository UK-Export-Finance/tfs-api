import { Controller, Get, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { GetPartiesBySearchTextResponse, GetPartiesBySearchTextResponseElement } from './dto/get-parties-by-search-text-response-element.dto';
import { PartiesQueryDto } from './dto/parties-query.dto';
import { PartyService } from './party.service';

@Controller('parties')
export class PartyController {
  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService, private readonly partyService: PartyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all parties matching the specified search text.',
  })
  @ApiOkResponse({
    description: 'The matching parties have been successfully retrieved.',
    type: GetPartiesBySearchTextResponseElement,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getPartiesBySearchText(@Query() query: PartiesQueryDto): Promise<GetPartiesBySearchTextResponse> {
    const token = await this.acbsAuthenticationService.getIdToken();
    const response = await this.partyService.getPartiesBySearchText(token, query.searchText);

    return response;
  }
}

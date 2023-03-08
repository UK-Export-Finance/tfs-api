import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { GetPartiesBySearchTextResponse, GetPartiesBySearchTextResponseElement } from './dto/get-parties-by-search-text-response-element.dto';
import { GetPartyByIdentifierResponse } from './dto/get-party-by-response.dto';
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

  @Get(':partyIdentifier')
  @ApiOperation({ summary: 'Get the party matching the specified party identifier.' })
  @ApiParam({
    name: 'partyIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the party in ACBS.',
    example: '00000001',
  })
  @ApiOkResponse({
    description: 'The party has been successfully retrieved.',
    type: GetPartyByIdentifierResponse,
  })
  @ApiNotFoundResponse({
    description: 'The specified party was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  getPartyByIdentifier(@Param('partyIdentifier') partyIdentifier: string): Promise<GetPartyByIdentifierResponse> {
    return this.partyService.getPartyByIdentifier(partyIdentifier);
  }
}

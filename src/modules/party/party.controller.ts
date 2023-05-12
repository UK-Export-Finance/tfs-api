import { Body, Controller, Get, HttpStatus, Param, ParseArrayPipe, Post, Query, Res } from '@nestjs/common';
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
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { Response } from 'express';

import { CreatePartyRequest, CreatePartyRequestItem } from './dto/create-party-request.dto';
import { CreatePartyResponse } from './dto/create-party-response.dto';
import { GetPartiesBySearchTextQuery } from './dto/get-parties-by-search-text-query.dto';
import { GetPartiesBySearchTextResponse, GetPartiesBySearchTextResponseItem } from './dto/get-parties-by-search-text-response.dto';
import { GetPartyByIdentifierResponse } from './dto/get-party-by-identifier-response.dto';
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
    type: GetPartiesBySearchTextResponseItem,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getPartiesBySearchText(@Query() query: GetPartiesBySearchTextQuery): Promise<GetPartiesBySearchTextResponse> {
    return await this.partyService.getPartiesBySearchText(query.searchText);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new party if there are no parties matching this alternate identifier.',
  })
  @ApiBody({
    type: CreatePartyRequestItem,
    isArray: true,
  })
  @ApiOkResponse({
    description: 'One or more parties matching this alternate identifier already exist.',
    type: CreatePartyResponse,
  })
  @ApiCreatedResponse({
    description: 'The party has been successfully created.',
    type: CreatePartyResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async createParty(
    @Body(new ParseArrayPipe({ items: CreatePartyRequestItem }))
    createPartyDto: CreatePartyRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CreatePartyResponse> {
    const newParty = createPartyDto[0];
    const partyIdentifierOfMatchingParty = await this.partyService.getPartyIdentifierBySearchText(newParty.alternateIdentifier);

    if (partyIdentifierOfMatchingParty) {
      res.status(HttpStatus.OK);
      return partyIdentifierOfMatchingParty;
    }

    return this.partyService.createParty(newParty);
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
  async getPartyByIdentifier(@Param('partyIdentifier') partyIdentifier: string): Promise<GetPartyByIdentifierResponse> {
    const party = await this.partyService.getPartyByIdentifier(partyIdentifier);
    return {
      alternateIdentifier: party.alternateIdentifier,
      industryClassification: party.industryClassification,
      name1: party.name1,
      name2: party.name2,
      name3: party.name3,
      smeType: party.smeType,
      citizenshipClass: party.citizenshipClass,
      officerRiskDate: party.officerRiskDate,
      countryCode: party.countryCode,
    };
  }
}

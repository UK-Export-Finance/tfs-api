import { Controller, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
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
import { ENUMS } from '@ukef/constants';
import { SOVEREIGN_ACCOUNT_TYPES } from '@ukef/constants/sovereign-account-types.constant';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { Response } from 'express';

import { PartyExternalRatingService } from '../party-external-rating/party-external-rating.service';
import { CreatePartyRequestDto, CreatePartyRequestItem } from './dto/create-party-request.dto';
import { CreatePartyResponse } from './dto/create-party-response.dto';
import { GetPartiesBySearchTextQuery } from './dto/get-parties-by-search-text-query.dto';
import { GetPartiesBySearchTextResponse, GetPartiesBySearchTextResponseItem } from './dto/get-parties-by-search-text-response.dto';
import { GetPartyByIdentifierResponseItem } from './dto/get-party-by-identifier-response.dto';
import { PartyService } from './party.service';

@Controller('parties')
export class PartyController {
  constructor(private readonly partyService: PartyService, private readonly partyExternalRatingService: PartyExternalRatingService) {}

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
    @ValidatedArrayBody({ items: CreatePartyRequestItem })
    createPartyDto: CreatePartyRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CreatePartyResponse> {
    const [newParty] = createPartyDto;
    const { alternateIdentifier, officerRiskDate: ratedDate } = newParty;

    const partyIdentifierOfMatchingParty = await this.partyService.getPartyIdentifierBySearchText(alternateIdentifier);

    if (partyIdentifierOfMatchingParty) {
      res.status(HttpStatus.OK);
      return partyIdentifierOfMatchingParty;
    }

    const { partyIdentifier } = await this.partyService.createParty(newParty);

    const existingExternalRatingsOfParty = await this.partyExternalRatingService.getExternalRatingsForParty(partyIdentifier);

    if (Array.isArray(existingExternalRatingsOfParty) && existingExternalRatingsOfParty.length === 0) {
      // TODO APIM-336: This is a placeholder function which returns a hard-coded value, and should be replaced when Informatica is ready.
      const [salesforceParty] = await this.salesforceGetPartyByAlternateIdentifierPlaceholder();

      const accountType = salesforceParty?.account?.type;
      const { SOVEREIGN, CORPORATE } = ENUMS.ASSIGNED_RATING_CODES;
      const assignedRatingCode = SOVEREIGN_ACCOUNT_TYPES.includes(accountType) ? SOVEREIGN : CORPORATE;

      await this.partyExternalRatingService.createExternalRatingForParty(partyIdentifier, { assignedRatingCode, ratedDate });
    }

    return { partyIdentifier };
  }

  // TODO APIM-336: This is a placeholder function which returns a hard-coded value, and should be replaced when Informatica is ready.
  async salesforceGetPartyByAlternateIdentifierPlaceholder() {
    return await [{ account: { type: 'Overseas Government Dept' } }];
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
    type: GetPartyByIdentifierResponseItem,
  })
  @ApiNotFoundResponse({
    description: 'The specified party was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getPartyByIdentifier(@Param('partyIdentifier') partyIdentifier: string): Promise<GetPartyByIdentifierResponseItem> {
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

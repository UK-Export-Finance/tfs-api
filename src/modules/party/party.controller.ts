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
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { AssignedRatingCodeProvider } from '@ukef/modules/party/assigned-rating-code.provider';
import { Response } from 'express';

import { PartyExternalRatingService } from '../party-external-rating/party-external-rating.service';
import { CreatePartyRequestDto, CreatePartyRequestItem } from './dto/create-party-request.dto';
import { CreatePartyResponse } from './dto/create-party-response.dto';
import { GetPartiesBySearchTextQuery } from './dto/get-parties-by-search-text-query.dto';
import { GetPartiesBySearchTextResponse, GetPartiesBySearchTextResponseItem } from './dto/get-parties-by-search-text-response.dto';
import { GetPartyByIdentifierResponseDto } from './dto/get-party-by-identifier-response.dto';
import { PartyService } from './party.service';

@Controller('parties')
export class PartyController {
  constructor(
    private readonly partyService: PartyService,
    private readonly partyExternalRatingService: PartyExternalRatingService,
    private readonly assignedRatingCodeProvider: AssignedRatingCodeProvider,
  ) {}

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
    const [partyToCreate] = createPartyDto;

    const { partyIdentifier, partyWasCreated } = await this.createPartyIfItDoesNotExist(partyToCreate);

    if (!partyWasCreated) {
      res.status(HttpStatus.OK);
    }

    const existingExternalRatingsOfParty = await this.partyExternalRatingService.getExternalRatingsForParty(partyIdentifier);

    if (Array.isArray(existingExternalRatingsOfParty) && existingExternalRatingsOfParty.length === 0) {
      // TODO APIM-336: This is a placeholder function which returns a hard-coded value, and should be replaced when Informatica is ready.
      const assignedRatingCode = this.assignedRatingCodeProvider.getAssignedRatingCode();

      const { officerRiskDate: ratedDate } = partyToCreate;

      await this.partyExternalRatingService.createExternalRatingForParty(partyIdentifier, { assignedRatingCode, ratedDate });
    }

    return { partyIdentifier };
  }

  private async createPartyIfItDoesNotExist(partyToCreate: CreatePartyRequestItem) {
    const { alternateIdentifier } = partyToCreate;

    const getPartyIdBySearchTextResponse = await this.partyService.getPartyIdentifierBySearchText(alternateIdentifier);

    if (!getPartyIdBySearchTextResponse) {
      const { partyIdentifier } = await this.partyService.createParty(partyToCreate);
      return { partyIdentifier, partyWasCreated: true };
    } else {
      const { partyIdentifier } = getPartyIdBySearchTextResponse;
      return { partyIdentifier, partyWasCreated: false };
    }
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
    type: GetPartyByIdentifierResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'The specified party was not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getPartyByIdentifier(@Param('partyIdentifier') partyIdentifier: string): Promise<GetPartyByIdentifierResponseDto> {
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

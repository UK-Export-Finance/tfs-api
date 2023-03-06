import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

import { GetPartyExternalRatingResponse, GetPartyExternalRatingsResponse } from './dto/get-party-external-ratings-response.dto';
import { PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL } from './party-external-rating.module-definition';
import { PartyExternalRatingsProvider } from './party-external-ratings.provider';

@Controller()
export class PartyExternalRatingController {
  constructor(@Inject(PARTY_EXTERNAL_RATINGS_PROVIDER_SYMBOL) private readonly partyExternalRatingsProvider: PartyExternalRatingsProvider) {}

  @Get('/party/:partyIdentifier/external-rating')
  @ApiOperation({ summary: 'Get all external ratings for a party.' })
  @ApiParam({
    name: 'partyIdentifier',
    required: true,
    type: 'string',
    description: 'The identifier of the party in ACBS.',
    example: '00000001',
  })
  @ApiOkResponse({
    description: 'The external ratings for the party have been successfully retrieved.',
    type: GetPartyExternalRatingResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'The specified party, or the external ratings for that party, were not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  async getExternalRatingsForParty(
    @Param('partyIdentifier')
    partyIdentifier: string,
  ): Promise<GetPartyExternalRatingsResponse> {
    const externalRatings = await this.partyExternalRatingsProvider.getExternalRatingsForParty(partyIdentifier);
    return externalRatings.map((externalRating) => ({
      partyIdentifier: externalRating.partyIdentifier,
      ratingEntity: {
        ratingEntityCode: externalRating.ratingEntity.ratingEntityCode,
      },
      assignedRating: {
        assignedRatingCode: externalRating.assignedRating.assignedRatingCode,
      },
      ratedDate: externalRating.ratedDate,
      probabilityofDefault: externalRating.probabilityofDefault,
      lossGivenDefault: externalRating.lossGivenDefault,
      riskWeighting: externalRating.riskWeighting,
      externalRatingNote1: externalRating.externalRatingNote1,
      externalRatingNote2: externalRating.externalRatingNote2,
      externalRatingUserCode1: externalRating.externalRatingUserCode1,
      externalRatingUserCode2: externalRating.externalRatingUserCode2,
    }));
  }
}

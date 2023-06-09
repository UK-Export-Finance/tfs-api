import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExcpetionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreatePartyExternalRatingRequestDto } from './dto/acbs-create-party-external-rating-request.dto';
import { AcbsGetPartyExternalRatingsResponseDto } from './dto/acbs-get-party-external-ratings-response.dto';
import { getPartyNotFoundKnownAcbsError, postPartyExternalRatingNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyExternalRatingService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrlAndUseReturnExcpetionHeader,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getExternalRatingsForParty(partyIdentifier: string, idToken: string): Promise<AcbsGetPartyExternalRatingsResponseDto> {
    const { data: externalRatingsInAcbs } = await this.acbsHttpService.get<AcbsGetPartyExternalRatingsResponseDto>({
      path: `/Party/${partyIdentifier}/PartyExternalRating`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the external ratings for the party with id ${partyIdentifier}.`,
        knownErrors: [getPartyNotFoundKnownAcbsError(partyIdentifier)],
      }),
    });

    return externalRatingsInAcbs;
  }

  async createExternalRatingForParty(acbsCreatePartyExternalRatingRequest: AcbsCreatePartyExternalRatingRequestDto, idToken: string): Promise<void> {
    const { PartyIdentifier } = acbsCreatePartyExternalRatingRequest;
    await this.acbsHttpService.post<AcbsCreatePartyExternalRatingRequestDto>({
      path: `/Party/${PartyIdentifier}/PartyExternalRating`,
      requestBody: acbsCreatePartyExternalRatingRequest,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: 'Failed to create party external rating in ACBS.',
        knownErrors: [postPartyExternalRatingNotFoundKnownAcbsError(PartyIdentifier)],
      }),
    });
  }
}

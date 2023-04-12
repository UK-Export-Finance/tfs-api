import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsPartyExternalRatingsResponseDto } from './dto/acbs-party-external-ratings-response.dto';
import { getPartyNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyExternalRatingService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrl,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getExternalRatingsForParty(partyIdentifier: string, idToken: string): Promise<AcbsPartyExternalRatingsResponseDto> {
    const { data: externalRatingsInAcbs } = await this.acbsHttpService.get<AcbsPartyExternalRatingsResponseDto>({
      path: `/Party/${partyIdentifier}/PartyExternalRating`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the external ratings for the party with id ${partyIdentifier}.`,
        knownErrors: [getPartyNotFoundKnownAcbsError(partyIdentifier)],
      }),
    });

    return externalRatingsInAcbs;
  }
}

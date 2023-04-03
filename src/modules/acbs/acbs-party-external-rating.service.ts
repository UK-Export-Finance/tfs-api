import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsPartyExternalRatingsResponseDto } from './dto/acbs-party-external-ratings-response.dto';
import { createWrapAcbsHttpErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyExternalRatingService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getExternalRatingsForParty(partyIdentifier: string, idToken: string): Promise<AcbsPartyExternalRatingsResponseDto> {
    const { data: externalRatingsInAcbs } = await this.acbsHttpService.get<AcbsPartyExternalRatingsResponseDto>({
      path: `/Party/${partyIdentifier}/PartyExternalRating`,
      idToken,
      onError: createWrapAcbsHttpErrorCallback({
        resourceIdentifier: partyIdentifier,
        messageForUnknownException: `Failed to get the external ratings for the party with id ${partyIdentifier}.`,
      }),
    });

    return externalRatingsInAcbs;
  }
}

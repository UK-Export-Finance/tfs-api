import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetPartyResponseDto } from './dto/acbs-get-party-response.dto';
import { getPartyNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrl,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getPartyByIdentifier(partyIdentifier: string, idToken: string): Promise<AcbsGetPartyResponseDto> {
    const { data: party } = await this.acbsHttpService.get<AcbsGetPartyResponseDto>({
      path: `/Party/${partyIdentifier}`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the party with identifier ${partyIdentifier}.`,
        knownErrors: [getPartyNotFoundKnownAcbsError(partyIdentifier)],
      }),
    });
    return party;
  }
}

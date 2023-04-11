import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetPartyResponseDto } from './dto/acbs-get-party-response.dto';
import { getPartyNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
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

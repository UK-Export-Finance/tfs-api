import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsGetPartiesBySearchTextResponseDto } from '../party/dto/acbs-get-parties-by-search-text-response.dto';
import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreatePartyRequest } from './dto/acbs-create-party-request.dto';
import { AcbsGetPartyResponseDto } from './dto/acbs-get-party-response.dto';
import { getPartyNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrlAndUseReturnExceptionHeader,
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

  async getPartyBySearchText(searchText: string, idToken: string): Promise<AcbsGetPartiesBySearchTextResponseDto> {
    const { data: party } = await this.acbsHttpService.get<AcbsGetPartiesBySearchTextResponseDto>({
      path: `/Party/Search/${searchText}`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get parties from ACBS with search text ${searchText}.`,
        knownErrors: [],
      }),
    });
    return party;
  }

  async createParty(partyToCreate: AcbsCreatePartyRequest, idToken: string): Promise<{ partyIdentifier: string }> {
    const response = await this.acbsHttpService
      .post<AcbsCreatePartyRequest>({
        path: `/Party`,
        requestBody: partyToCreate,
        idToken,
        onError: createWrapAcbsHttpPostOrPutErrorCallback({
          messageForUnknownError: 'Failed to create party in ACBS.',
          knownErrors: [],
        }),
      })
      .then((acbsResponse) => {
        const locationHeader = acbsResponse.headers.location;
        const indexOfLastSlash = locationHeader.lastIndexOf('/');
        const partyIdentifier = locationHeader.substring(indexOfLastSlash + 1);
        return {
          partyIdentifier: partyIdentifier,
        };
      });

    return response;
  }
}

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';

import { AcbsPartyExternalRatingsResponseDto } from './dto/acbs-party-external-ratings-response.dto';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

@Injectable()
export class AcbsService {
  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
  ) {}

  async getExternalRatingsForParty(partyIdentifier: string, authToken: string): Promise<AcbsPartyExternalRatingsResponseDto> {
    const { data: externalRatingsInAcbs } = await lastValueFrom(
      this.httpService
        .get<AcbsPartyExternalRatingsResponseDto>(`/Party/${partyIdentifier}/PartyExternalRating`, {
          baseURL: this.config.baseUrl,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .pipe(
          catchError((error: Error) => {
            if (error instanceof AxiosError && error.response && typeof error.response.data === 'string' && error.response.data.includes('Party not found')) {
              throw new AcbsResourceNotFoundException(`Party with identifier ${partyIdentifier} was not found by ACBS.`, error);
            }
            throw new AcbsException(`Failed to get the external ratings for the party with id ${partyIdentifier}.`, error);
          }),
        ),
    );

    return externalRatingsInAcbs;
  }
}

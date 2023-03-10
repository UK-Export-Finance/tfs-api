import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { lastValueFrom } from 'rxjs';

import { AcbsPartyExternalRatingsResponseDto } from './dto/acbs-party-external-ratings-response.dto';
import { wrapAcbsHttpError } from './wrap-acbs-http-error';

@Injectable()
export class AcbsPartyExternalRatingService {
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
          wrapAcbsHttpError({
            resourceIdentifier: partyIdentifier,
            messageForUnknownException: `Failed to get the external ratings for the party with id ${partyIdentifier}.`,
          }),
        ),
    );

    return externalRatingsInAcbs;
  }
}

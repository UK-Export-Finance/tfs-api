import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { lastValueFrom } from 'rxjs';

import { AcbsGetPartyResponseDto } from './dto/acbs-get-party-response.dto';
import { wrapAcbsHttpError } from './wrap-acbs-http-error';

@Injectable()
export class AcbsPartyService {
  constructor(@Inject(AcbsConfig.KEY) private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, private readonly httpService: HttpService) {}

  async getPartyByIdentifier(partyIdentifier: string, idToken: string): Promise<AcbsGetPartyResponseDto> {
    const { data: party } = await lastValueFrom(
      this.httpService
        .get<AcbsGetPartyResponseDto>(`/Party/${partyIdentifier}`, {
          baseURL: this.config.baseUrl,
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .pipe(
          wrapAcbsHttpError({
            resourceIdentifier: partyIdentifier,
            messageForUnknownException: `Failed to get the party with identifier ${partyIdentifier}.`,
          }),
        ),
    );
    return party;
  }
}

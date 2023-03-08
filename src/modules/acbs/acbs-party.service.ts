import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { AxiosError } from 'axios';
import { catchError, lastValueFrom } from 'rxjs';

import { AcbsGetPartyResponseDto } from './dto/acbs-get-party-response.dto';
import { AcbsException } from './exception/acbs.exception';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';

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
          catchError((error: Error) => {
            if (error instanceof AxiosError && error.response && typeof error.response.data === 'string' && error.response.data.includes('Party not found')) {
              throw new AcbsResourceNotFoundException(`Party with identifier ${partyIdentifier} was not found by ACBS.`, error);
            }
            throw new AcbsException(`Failed to get the party with identifier ${partyIdentifier}.`, error);
          }),
        ),
    );
    return party;
  }
}

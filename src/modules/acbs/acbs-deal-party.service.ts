import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { lastValueFrom } from 'rxjs';

import { AcbsGetDealPartyResponseDto } from './dto/acbs-get-deal-party-response.dto';
import { wrapAcbsHttpError } from './wrap-acbs-http-error';

@Injectable()
export class AcbsDealPartyService {
  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
  ) {}

  async getDealPartyForDeal(portfolio: string, dealIdentifier: string, authToken: string): Promise<AcbsGetDealPartyResponseDto[]> {
    const { data: dealPartiesInAcbs } = await lastValueFrom(
      this.httpService
        .get<AcbsGetDealPartyResponseDto>(`/Portfolio/${portfolio}/Deal/${dealIdentifier}/DealParty`, {
          baseURL: this.config.baseUrl,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        .pipe(
          wrapAcbsHttpError({
            resourceIdentifier: dealIdentifier,
            messageForUnknownException: `Failed to get the deal investors for the deal with id ${dealIdentifier}.`,
          }),
        ),
    );

    return dealPartiesInAcbs;
  }
}

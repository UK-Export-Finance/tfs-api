import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetDealPartyResponseDto } from './dto/acbs-get-deal-party-response.dto';
import { createWrapAcbsHttpErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getDealPartiesForDeal(portfolio: string, dealIdentifier: string, idToken: string): Promise<AcbsGetDealPartyResponseDto[]> {
    const { data: dealPartiesInAcbs } = await this.acbsHttpService.get<AcbsGetDealPartyResponseDto[]>({
      path: `/Portfolio/${portfolio}/Deal/${dealIdentifier}/DealParty`,
      idToken,
      onError: createWrapAcbsHttpErrorCallback({
        resourceIdentifier: dealIdentifier,
        messageForUnknownException: `Failed to get the deal investors for the deal with id ${dealIdentifier}.`,
      }),
    });

    return dealPartiesInAcbs;
  }
}

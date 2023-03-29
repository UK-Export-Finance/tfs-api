import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealDto } from './dto/acbs-create-deal.dto';
import { createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createDeal(portfolioIdentifier: string, newDeal: AcbsCreateDealDto, idToken: string): Promise<void> {
    await this.acbsHttpService.post<AcbsCreateDealDto>({
      path: `/Portfolio/${portfolioIdentifier}/Deal`,
      requestBody: newDeal,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a deal with identifier ${newDeal.DealIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });
  }
}

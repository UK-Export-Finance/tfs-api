import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealDto } from './dto/acbs-create-deal.dto';
import { AcbsGetDealResponseDto } from './dto/acbs-get-deal-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

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
      path: this.getAcbsDealPath(portfolioIdentifier),
      requestBody: newDeal,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a deal with identifier ${newDeal.DealIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });
  }

  async getDealByIdentifier(portfolioIdentifier: string, dealIdentifier: string, idToken: string): Promise<AcbsGetDealResponseDto> {
    const { data: deal } = await this.acbsHttpService.get<AcbsGetDealResponseDto>({
      path: `${this.getAcbsDealPath(portfolioIdentifier)}/${dealIdentifier}`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the deal with identifier ${dealIdentifier}.`,
        knownErrors: [],
      }),
    });

    if (deal === null) {
      throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`);
    }

    return deal;
  }

  private getAcbsDealPath(portfolioIdentifier: string): string {
    return `/Portfolio/${portfolioIdentifier}/Deal`;
  }
}

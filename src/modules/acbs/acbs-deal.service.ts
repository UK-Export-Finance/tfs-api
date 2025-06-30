import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealDto } from './dto/acbs-create-deal.dto';
import { AcbsGetDealResponseDto } from './dto/acbs-get-deal-response.dto';
import { AcbsUpdateDealDto } from './dto/acbs-update-deal.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrlAndUseReturnExceptionHeader,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createDeal(portfolioIdentifier: string, deal: AcbsCreateDealDto, idToken: string): Promise<void> {
    await this.acbsHttpService.post<AcbsCreateDealDto>({
      path: this.getAcbsDealPath(portfolioIdentifier),
      requestBody: deal,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a deal with identifier ${deal.DealIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });
  }

  async updateDeal(portfolioIdentifier: string, deal: AcbsUpdateDealDto, idToken: string): Promise<void> {
    await this.acbsHttpService.put<AcbsUpdateDealDto, AcbsGetDealResponseDto>({
      path: this.getAcbsDealPath(portfolioIdentifier),
      requestBody: deal,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to update a deal with identifier ${deal.DealIdentifier} in ACBS.`,
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

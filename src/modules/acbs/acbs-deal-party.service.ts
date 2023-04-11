import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealInvestorRequest } from './dto/acbs-create-deal-investor-request.dto';
import { AcbsGetDealPartyResponseDto } from './dto/acbs-get-deal-party-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

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
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the deal investors for the deal with id ${dealIdentifier}.`,
        knownErrors: [],
      }),
    });

    if (dealPartiesInAcbs === null) {
      throw new AcbsResourceNotFoundException(`Deal Investors for Deal ${dealIdentifier} were not found by ACBS.`);
    }

    return dealPartiesInAcbs;
  }

  async createInvestorForDeal(dealIdentifier: string, newDealInvestor: AcbsCreateDealInvestorRequest, idToken: string): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    await this.acbsHttpService.post<AcbsCreateDealInvestorRequest>({
      path: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`,
      requestBody: newDealInvestor,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create an investor for deal ${dealIdentifier} in ACBS.`,
        knownErrors: [
          {
            substringToFind: 'The deal not found',
            throwError: (error) => {
              throw new AcbsResourceNotFoundException(`Deal with identifier ${dealIdentifier} was not found by ACBS.`, error);
            },
          },
        ],
      }),
    });
  }
}

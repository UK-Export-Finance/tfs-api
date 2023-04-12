import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealGuaranteeDto } from './dto/acbs-create-deal-guarantee.dto';
import { AcbsGetDealGuaranteeResponseDto } from './dto/acbs-get-deal-guarantee-response.dto';
import { getDealNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealGuaranteeService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createGuaranteeForDeal(dealIdentifier: string, newDealGuarantee: AcbsCreateDealGuaranteeDto, idToken: string): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    await this.acbsHttpService.post<AcbsCreateDealGuaranteeDto>({
      path: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`,
      requestBody: newDealGuarantee,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`,
        knownErrors: [getDealNotFoundKnownAcbsError(dealIdentifier)],
      }),
    });
  }

  async getGuaranteesForDeal(portfolio: string, dealIdentifier: string, idToken: string): Promise<AcbsGetDealGuaranteeResponseDto[]> {
    const { data: dealPartiesInAcbs } = await this.acbsHttpService.get<AcbsGetDealGuaranteeResponseDto[]>({
      path: `/Portfolio/${portfolio}/Deal/${dealIdentifier}/DealGuarantee`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the deal guarantees for the deal with id ${dealIdentifier}.`,
        knownErrors: [getDealNotFoundKnownAcbsError(dealIdentifier)],
      }),
    });

    return dealPartiesInAcbs;
  }
}

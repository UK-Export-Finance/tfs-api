import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateDealGuaranteeDto } from './dto/acbs-create-deal-guarantee.dto';
import { createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

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
        resourceIdentifier: dealIdentifier,
        messageForUnknownException: `Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`,
      }),
    });
  }
}

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { AcbsCreateDealGuaranteeDto } from './dto/acbs-create-deal-guarantee.dto';
import { wrapAcbsHttpPostError } from './wrap-acbs-http-error';

@Injectable()
export class AcbsDealGuaranteeService {
  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
  ) {}

  async createGuaranteeForDeal(dealIdentifier: string, newDealGuarantee: AcbsCreateDealGuaranteeDto, idToken: string): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    await lastValueFrom(
      this.httpService
        .post<never>(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, newDealGuarantee, {
          baseURL: this.config.baseUrl,
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        })
        .pipe(
          wrapAcbsHttpPostError<AxiosResponse<never, any>, any>({
            resourceIdentifier: dealIdentifier,
            messageForUnknownException: `Failed to create a guarantee for deal ${dealIdentifier} in ACBS.`,
          }),
        ),
    );
  }

  async getGuaranteeForDeal(dealIdentifier: string, idToken: string): Promise<any> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    await lastValueFrom(
      this.httpService
        .get<never>(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, {
          baseURL: this.config.baseUrl,
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        })
        .pipe(
          wrapAcbsHttpPostError<AxiosResponse<never, any>, any>({
            resourceIdentifier: dealIdentifier,
            messageForUnknownException: `Failed to get a guarantee for deal ${dealIdentifier} in ACBS.`,
          }),
        ),
    );
  }
}

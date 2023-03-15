import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

@Injectable()
export class AcbsDealService {
  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
  ) {}

  async createDeal(portfolioIdentifier: string, requestBody: any, authToken: string): Promise<any> {
    return await this.httpService.post(`/Portfolio/${portfolioIdentifier}/Deal`, requestBody, {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
}

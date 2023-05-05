import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityLoanTransactionResponseDto } from './dto/acbs-get-facility-loan-transaction-response.dto';

export class AcbsFacilityLoanTransactionService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getLoanTransactionsForFacility(
    portfolioIdentifier: string,
    facilityIdentifier: string,
    idToken: string,
  ): Promise<AcbsGetFacilityLoanTransactionResponseDto> {
    portfolioIdentifier + facilityIdentifier + idToken;
    const loanTransactions = [];
    return await loanTransactions;
  }
}

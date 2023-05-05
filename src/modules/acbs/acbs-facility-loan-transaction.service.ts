import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityLoanTransactionResponseItem } from './dto/acbs-get-facility-loan-transaction-response.dto';
import { getLoanTransactionNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityLoanTransactionService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getLoanTransactionByBundleIdentifier(bundleIdentifier: string, idToken: string): Promise<AcbsGetFacilityLoanTransactionResponseItem> {
    const { data: loanTransaction } = await this.acbsHttpService.get<AcbsGetFacilityLoanTransactionResponseItem>({
      path: `/BundleInformation/${bundleIdentifier}?returnItems=true`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the loan transaction with bundle identifier ${bundleIdentifier}.`,
        knownErrors: [getLoanTransactionNotFoundKnownAcbsError(bundleIdentifier)],
      }),
    });
    return loanTransaction;
  }
}

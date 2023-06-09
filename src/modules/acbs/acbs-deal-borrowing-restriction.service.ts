import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExcpetionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsUpdateDealBorrowingRestrictionRequest } from './dto/acbs-update-deal-borrowing-restriction-request.dto';
import { getDealNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsDealBorrowingRestrictionService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrlAndUseReturnExcpetionHeader, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async updateBorrowingRestrictionForDeal(
    portfolioIdentifier: string,
    dealIdentifier: string,
    replacementDealBorrowingRestriction: AcbsUpdateDealBorrowingRestrictionRequest,
    idToken: string,
  ): Promise<void> {
    await this.acbsHttpService.put({
      path: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/BorrowingRestriction`,
      requestBody: replacementDealBorrowingRestriction,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to update a borrowing restriction for deal ${dealIdentifier} in ACBS.`,
        knownErrors: [getDealNotFoundKnownAcbsError(dealIdentifier)],
      }),
    });
  }
}

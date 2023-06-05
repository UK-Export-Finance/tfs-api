import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetLoanByLoanIdentifierResponseDto } from './dto/acbs-get-loan-by-loan-identifier-response.dto';
import { AcbsUpdateLoanRequest } from './dto/acbs-update-loan-request.dto';
import { loanNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsLoanService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getLoanByIdentifier(portfolioIdentifier: string, loanIdentifier: string, idToken: string): Promise<AcbsGetLoanByLoanIdentifierResponseDto> {
    const { data: loan } = await this.acbsHttpService.get<AcbsGetLoanByLoanIdentifierResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the loan with the loan identifier ${loanIdentifier}.`,
        knownErrors: [loanNotFoundKnownAcbsError(loanIdentifier)],
      }),
    });

    return loan;
  }

  async updateLoanByIdentifier(portfolioIdentifier: string, acbsUpdateLoanRequest: AcbsUpdateLoanRequest, idToken: string) {
    const { LoanIdentifier: loanIdentifier } = acbsUpdateLoanRequest;
    await this.acbsHttpService.put<AcbsUpdateLoanRequest, void>({
      path: `/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`,
      requestBody: acbsUpdateLoanRequest,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to update loan with identifier ${loanIdentifier} in ACBS.`,
        knownErrors: [loanNotFoundKnownAcbsError(loanIdentifier)],
      }),
    });
  }
}

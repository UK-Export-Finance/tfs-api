import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityLoanResponseDto } from './dto/acbs-get-facility-loan-response.dto';
import { facilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityLoanService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrlAndUseReturnExceptionHeader, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getLoansForFacility(portfolioIdentifier: string, facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityLoanResponseDto> {
    const { data: loans } = await this.acbsHttpService.get<AcbsGetFacilityLoanResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Loan`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the loans for the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });

    return loans;
  }
}

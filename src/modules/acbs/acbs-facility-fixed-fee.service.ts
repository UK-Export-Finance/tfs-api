import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityFixedFeeResponseDto } from './dto/acbs-get-facility-fixed-fee-response.dto';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

export class AcbsFacilityFixedFeeService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getFixedFeesForFacility(portfolioIdentifier: string, facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityFixedFeeResponseDto> {
    const { data: fixedFees } = await this.acbsHttpService.get<AcbsGetFacilityFixedFeeResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the fixed fees for the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [],
      }),
    });

    return fixedFees;
  }
}
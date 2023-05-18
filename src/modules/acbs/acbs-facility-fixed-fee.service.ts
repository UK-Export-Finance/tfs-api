import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityFixedFeeRequestDto } from './dto/acbs-create-facility-fixed-fee-request.dto';
import { AcbsGetFacilityFixedFeeResponseDto } from './dto/acbs-get-facility-fixed-fee-response.dto';
import { postFacilityNotFound2KnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

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

  async createFixedFeeForFacility(
    portfolioIdentifier: string,
    facilityIdentifier: string,
    newFacilityFixedFee: AcbsCreateFacilityFixedFeeRequestDto,
    idToken: string,
  ): Promise<void> {
    await this.acbsHttpService.post<AcbsCreateFacilityFixedFeeRequestDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee/FixedFee`,
      requestBody: newFacilityFixedFee,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a fixed fee for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [postFacilityNotFound2KnownAcbsError(facilityIdentifier)],
      }),
    });
  }
}

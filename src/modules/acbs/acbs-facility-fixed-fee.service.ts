import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrlAndUseReturnExcpetionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityFixedFeeRequestDto } from './dto/acbs-create-facility-fixed-fee-request.dto';
import { AcbsGetFacilityFixedFeeResponseDto } from './dto/acbs-get-facility-fixed-fee-response.dto';
import { postFixedFeeExistsKnownAcbsError, postInvalidPortfolioAndFacilityIdCombinationKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityFixedFeeService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrlAndUseReturnExcpetionHeader, httpService: HttpService) {
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
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a fixed fee for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [postInvalidPortfolioAndFacilityIdCombinationKnownAcbsError(facilityIdentifier), postFixedFeeExistsKnownAcbsError()],
      }),
    });
  }
}

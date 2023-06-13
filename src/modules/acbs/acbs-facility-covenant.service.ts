import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsConfigBaseUrlAndUseReturnExceptionHeader } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityCovenantRequestDto } from './dto/acbs-create-facility-covenant-request.dto';
import { AcbsGetFacilityCovenantsResponseDto } from './dto/acbs-get-facility-covenants-response.dto';
import { facilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityCovenantService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrlAndUseReturnExceptionHeader, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createCovenantForFacility(facilityIdentifier: string, newFacilityCovenant: AcbsCreateFacilityCovenantRequestDto, idToken: string): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    await this.acbsHttpService.post<AcbsCreateFacilityCovenantRequestDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`,
      requestBody: newFacilityCovenant,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a covenant for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
  }

  async getCovenantsForFacility(portfolioIdentifier: string, facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityCovenantsResponseDto[]> {
    const { data: covenants } = await this.acbsHttpService.get<AcbsGetFacilityCovenantsResponseDto[]>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the covenants for the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [],
      }),
    });

    return covenants;
  }

  async replaceCovenantForFacility(
    portfolioIdentifier: string,
    facilityIdentifier: string,
    replacingCovenant: AcbsCreateFacilityCovenantRequestDto,
    idToken: string,
  ): Promise<void> {
    await this.acbsHttpService.put({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`,
      requestBody: replacingCovenant,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to replace covenant ${replacingCovenant.CovenantIdentifier} for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
  }
}

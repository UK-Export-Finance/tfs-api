import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityCovenantRequestDto } from './dto/acbs-create-facility-covenant-request.dto';
import { AcbsGetFacilityCovenantsResponseDto } from './dto/acbs-get-facility-covenants-response.dto';
import { getFacilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

export class AcbsFacilityCovenantService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createCovenantForFacility(facilityIdentifier: string, newFacilityCovenant: AcbsCreateFacilityCovenantRequestDto, idToken: string): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    await this.acbsHttpService.post<AcbsCreateFacilityCovenantRequestDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`,
      requestBody: newFacilityCovenant,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a covenant for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [getFacilityNotFoundKnownAcbsError(facilityIdentifier)],
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
}

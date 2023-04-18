import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityCovenantsResponseDto } from './dto/acbs-get-facility-covenants-response.dto';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

export class AcbsFacilityCovenantService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
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

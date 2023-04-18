import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityCovenantsResponseDto } from './dto/acbs-get-facility-covenants-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
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

    if (covenants.length === 0) {
      // The ACBS endpoint has surprising behaviour where a `200 OK` response with response body equal to the empty array
      // is returned if the facility does not exist, but also if the facility does exist but has no covenants. That means 
      // we do not know if the facility exists or not at this point.
      throw new AcbsResourceNotFoundException(`Covenants for facility with identifier ${facilityIdentifier} were not found by ACBS or the facility was not found by ACBS.`);
    }

    return covenants;
  }
}

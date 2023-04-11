import { HttpService } from '@nestjs/axios';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsGetFacilityGuaranteesResponseDto } from './dto/acbs-get-facility-guarantees-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { createWrapAcbsHttpGetErrorCallback } from './wrap-acbs-http-error-callback';

export class AcbsFacilityGuaranteeService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getGuaranteesForFacility(portfolioIdentifier: string, facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityGuaranteesResponseDto> {
    const { data: guarantees } = await this.acbsHttpService.get<AcbsGetFacilityGuaranteesResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the guarantees for the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [],
      }),
    });

    if (guarantees === null) {
      throw new AcbsResourceNotFoundException(`Guarantees for facility with identifier ${facilityIdentifier} were not found by ACBS.`);
    }

    return guarantees;
  }
}

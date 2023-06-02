import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityGuaranteeDto } from './dto/acbs-create-facility-guarantee.dto';
import { AcbsGetFacilityGuaranteesResponseDto } from './dto/acbs-get-facility-guarantees-response.dto';
import { AcbsUpdateFacilityGuaranteeRequest } from './dto/acbs-update-facility-guarantee-request.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { facilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityGuaranteeService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getGuaranteesForFacility(portfolioIdentifier: string, facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityGuaranteesResponseDto> {
    const { data: guarantees } = await this.acbsHttpService.get<AcbsGetFacilityGuaranteesResponseDto>({
      path: this.facilityGuaranteePath({ portfolioIdentifier, facilityIdentifier }),
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the guarantees for the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [],
      }),
    });

    if (guarantees === null) {
      // The ACBS endpoint has surprising behaviour where a `200 OK` response with response body `null` is returned if the
      // facility does not exist, but it can also be returned in cases where the facility does exist. That means we do not
      // know if the facility exists or not at this point.
      throw new AcbsResourceNotFoundException(`Guarantees for facility with identifier ${facilityIdentifier} were not found by ACBS.`);
    }

    return guarantees;
  }

  async createGuaranteeForFacility(facilityIdentifier: string, newFacilityGuarantee: AcbsCreateFacilityGuaranteeDto, idToken: string): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    await this.acbsHttpService.post<AcbsCreateFacilityGuaranteeDto>({
      path: this.facilityGuaranteePath({ portfolioIdentifier, facilityIdentifier }),
      requestBody: newFacilityGuarantee,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a guarantee for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
  }

  async replaceGuaranteeForFacility(
    portfolioIdentifier: string,
    facilityIdentifier: string,
    replacingGuarantee: AcbsUpdateFacilityGuaranteeRequest,
    idToken: string,
  ): Promise<void> {
    await this.acbsHttpService.put<AcbsUpdateFacilityGuaranteeRequest, never>({
      path: this.facilityGuaranteePath({ portfolioIdentifier, facilityIdentifier }),
      requestBody: replacingGuarantee,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to replace a guarantee for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
  }

  private facilityGuaranteePath({ portfolioIdentifier, facilityIdentifier }: { portfolioIdentifier: string; facilityIdentifier: string }): string {
    return `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`;
  }
}

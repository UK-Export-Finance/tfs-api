import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';

import { AcbsConfigBaseUrl } from './acbs-config-base-url.type';
import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityPartyDto } from './dto/acbs-create-facility-party.dto';
import { AcbsGetFacilityPartyResponseDto } from './dto/acbs-get-facility-party-response.dto';
import { AcbsResourceNotFoundException } from './exception/acbs-resource-not-found.exception';
import { getFacilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: AcbsConfigBaseUrl, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createPartyForFacility(facilityIdentifier: string, newFacilityParty: AcbsCreateFacilityPartyDto, idToken: string): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    await this.acbsHttpService.post<AcbsCreateFacilityPartyDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`,
      requestBody: newFacilityParty,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a party for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [getFacilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
  }

  async getFacilityPartiesForFacility(portfolioIdentifier: string, facilityIdentifier: UkefId, idToken: string): Promise<AcbsGetFacilityPartyResponseDto[]> {
    const { data: facilityPartiesInAcbs } = await this.acbsHttpService.get<AcbsGetFacilityPartyResponseDto[]>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to get a party for facility ${facilityIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });

    if (facilityPartiesInAcbs === null) {
      throw new AcbsResourceNotFoundException(`Facility with identifier ${facilityIdentifier} was not found by ACBS.`);
    }

    return facilityPartiesInAcbs;
  }
}

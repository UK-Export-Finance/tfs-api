import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityRequest } from './dto/acbs-create-facility-request.dto';
import { AcbsGetFacilityResponseDto } from './dto/acbs-get-facility-response.dto';
import { getFacilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    httpService: HttpService,
  ) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async getFacilityByIdentifier(facilityIdentifier: string, idToken: string): Promise<AcbsGetFacilityResponseDto> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const { data: facility } = await this.acbsHttpService.get<AcbsGetFacilityResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
      idToken,
      onError: createWrapAcbsHttpGetErrorCallback({
        messageForUnknownError: `Failed to get the facility with identifier ${facilityIdentifier}.`,
        knownErrors: [getFacilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
    return facility;
  }

  async createFacility(portfolioIdentifier: string, facilityToCreate: AcbsCreateFacilityRequest, idToken: string): Promise<void> {
    await this.acbsHttpService.post({
      path: `/Portfolio/${portfolioIdentifier}/Facility`,
      requestBody: facilityToCreate,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        messageForUnknownError: `Failed to create a facility with identifier ${facilityToCreate.FacilityIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });
  }
}

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { AcbsConfigBaseUrlAndUseReturnExcpetionHeader } from './acbs-config-base-url.type';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityRequest } from './dto/acbs-create-facility-request.dto';
import { AcbsGetFacilityResponseDto } from './dto/acbs-get-facility-response.dto';
import { AcbsUpdateFacilityRequest } from './dto/acbs-update-facility-request.dto';
import { AcbsUpdateFacilityResponseDto } from './dto/acbs-update-facility-response.dto';
import { facilityNotFoundKnownAcbsError } from './known-errors';
import { createWrapAcbsHttpGetErrorCallback, createWrapAcbsHttpPostOrPutErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(
    @Inject(AcbsConfig.KEY)
    config: AcbsConfigBaseUrlAndUseReturnExcpetionHeader,
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
        knownErrors: [facilityNotFoundKnownAcbsError(facilityIdentifier)],
      }),
    });
    return facility;
  }

  async createFacility(portfolioIdentifier: string, facilityToCreate: AcbsCreateFacilityRequest, idToken: string): Promise<void> {
    await this.acbsHttpService.post({
      path: `/Portfolio/${portfolioIdentifier}/Facility`,
      requestBody: facilityToCreate,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to create a facility with identifier ${facilityToCreate.FacilityIdentifier} in ACBS.`,
        knownErrors: [],
      }),
    });
  }

  async updateFacilityByIdentifier(
    portfolioIdentifier: string,
    facilityToUpdate: AcbsUpdateFacilityRequest,
    idToken: string,
  ): Promise<AcbsUpdateFacilityResponseDto> {
    const { data: facilityIdentifier } = await this.acbsHttpService.put<AcbsUpdateFacilityRequest, AcbsUpdateFacilityResponseDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityToUpdate.FacilityIdentifier}`,
      requestBody: facilityToUpdate,
      idToken,
      onError: createWrapAcbsHttpPostOrPutErrorCallback({
        messageForUnknownError: `Failed to update a facility with identifier ${facilityToUpdate.FacilityIdentifier} in ACBS.`,
        knownErrors: [facilityNotFoundKnownAcbsError(facilityToUpdate.FacilityIdentifier)],
      }),
    });
    return facilityIdentifier;
  }
}

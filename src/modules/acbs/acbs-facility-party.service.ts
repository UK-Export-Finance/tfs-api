import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';

import { AcbsHttpService } from './acbs-http.service';
import { AcbsCreateFacilityPartyDto } from './dto/acbs-create-facility-party.dto';
import { createWrapAcbsHttpPostErrorCallback } from './wrap-acbs-http-error-callback';

@Injectable()
export class AcbsFacilityPartyService {
  private readonly acbsHttpService: AcbsHttpService;

  constructor(@Inject(AcbsConfig.KEY) config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, httpService: HttpService) {
    this.acbsHttpService = new AcbsHttpService(config, httpService);
  }

  async createPartyForFacility(facilityIdentifier: string, newFacilityParty: AcbsCreateFacilityPartyDto, idToken: string): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    await this.acbsHttpService.post<AcbsCreateFacilityPartyDto>({
      path: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`,
      requestBody: newFacilityParty,
      idToken,
      onError: createWrapAcbsHttpPostErrorCallback({
        resourceIdentifier: facilityIdentifier,
        messageForUnknownException: `Failed to create a party for facility ${facilityIdentifier} in ACBS.`,
      }),
    });
  }
}
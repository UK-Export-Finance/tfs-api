import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { lastValueFrom } from 'rxjs';

import { AcbsCreateFacilityPartyDto } from './dto/acbs-create-facility-party.dto';
import { wrapAcbsHttpPostError } from './wrap-acbs-http-error';

@Injectable()
export class AcbsFacilityPartyService {
  constructor(@Inject(AcbsConfig.KEY) private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>, private readonly httpService: HttpService) {}

  async createPartyForFacility(facilityIdentifier: string, newFacilityParty: AcbsCreateFacilityPartyDto, idToken: string): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

    await lastValueFrom(
      this.httpService
        .post<never>(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`, newFacilityParty, {
          baseURL: this.config.baseUrl,
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        })
        .pipe(
          wrapAcbsHttpPostError({
            resourceIdentifier: facilityIdentifier,
            messageForUnknownException: `Failed to create a party for facility ${facilityIdentifier} in ACBS.`,
          }),
        ),
    );
  }
}

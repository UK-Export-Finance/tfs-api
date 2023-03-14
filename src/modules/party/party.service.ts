import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { AcbsAuthenticationService } from '@ukef/module/acbs/acbs-authentication.service';
import { AcbsPartyService } from '@ukef/module/acbs/acbs-party.service';
import { lastValueFrom } from 'rxjs';

import { AcbsGetPartiesBySearchTextResponseElement } from './dto/acbs-get-parties-by-search-text-response-element.dto';
import { GetPartiesBySearchTextResponseElement } from './dto/get-parties-by-search-text-response-element.dto';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { Party } from './party.interface';

@Injectable()
export class PartyService {
  private static readonly getPartiesBySearchTextPath = '/Party/Search';

  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsPartyService: AcbsPartyService,
  ) {}

  async getPartiesBySearchText(token: string, searchText: string): Promise<GetPartiesBySearchTextResponseElement[]> {
    if (searchText === null) {
      throw new GetPartiesBySearchTextException('The required query parameter searchText was not specified.');
    }

    if (searchText === '') {
      throw new GetPartiesBySearchTextException('The query parameter searchText must be non-empty.');
    }

    if (typeof searchText === 'string' && searchText.length < 3) {
      throw new GetPartiesBySearchTextException('The query parameter searchText must be at least 3 characters.');
    }

    const acbsRequest = {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const response = await lastValueFrom(
      this.httpService.get<AcbsGetPartiesBySearchTextResponseElement[]>(`${PartyService.getPartiesBySearchTextPath}/${searchText}`, acbsRequest),
    )
      .then((acbsResponse) =>
        acbsResponse.data.map((element) => ({
          alternateIdentifier: element.PartyAlternateIdentifier,
          industryClassification: element.IndustryClassification.IndustryClassificationCode,
          name1: element.PartyName1,
          name2: element.PartyName2,
          name3: element.PartyName3,
          smeType: element.MinorityClass.MinorityClassCode,
          citizenshipClass: element.CitizenshipClass.CitizenshipClassCode,
          officerRiskDate: element.OfficerRiskDate ? element.OfficerRiskDate.slice(0, 10) : null,
          countryCode: element.PrimaryAddress.Country.CountryCode,
        })),
      )
      .catch((error) => {
        throw new GetPartiesBySearchTextException('Failed to get parties from ACBS.', error);
      });

    return response;
  }

  async getPartyByIdentifier(partyIdentifier: string): Promise<Party> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const partyInAcbs = await this.acbsPartyService.getPartyByIdentifier(partyIdentifier, idToken);
    return {
      alternateIdentifier: partyInAcbs.PartyAlternateIdentifier,
      industryClassification: partyInAcbs.IndustryClassification.IndustryClassificationCode,
      name1: partyInAcbs.PartyName1,
      name2: partyInAcbs.PartyName2,
      name3: partyInAcbs.PartyName3,
      smeType: partyInAcbs.MinorityClass.MinorityClassCode,
      citizenshipClass: partyInAcbs.CitizenshipClass.CitizenshipClassCode,
      officerRiskDate: partyInAcbs.OfficerRiskDate && partyInAcbs.OfficerRiskDate.split('T')[0],
      countryCode: partyInAcbs.PrimaryAddress.Country.CountryCode,
    };
  }
}

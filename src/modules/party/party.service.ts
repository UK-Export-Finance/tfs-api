import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyService } from '@ukef/modules/acbs/acbs-party.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { lastValueFrom } from 'rxjs';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsGetPartiesBySearchTextResponse } from './dto/acbs-get-parties-by-search-text-response.dto';
import { CreatePartyRequestItem } from './dto/create-party-request.dto';
import { CreatePartyResponse } from './dto/create-party-response.dto';
import { GetPartiesBySearchTextResponse } from './dto/get-parties-by-search-text-response.dto';
import { CreatePartyInAcbsFailedException } from './exception/create-party-in-acbs-failed.exception';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { Party } from './party.interface';

@Injectable()
export class PartyService {
  private static readonly getPartiesBySearchTextPath = '/Party/Search';
  private static readonly createPartyPath = '/Party';

  constructor(
    @Inject(AcbsConfig.KEY)
    private readonly config: Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>,
    private readonly httpService: HttpService,
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsPartyService: AcbsPartyService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getPartiesBySearchTextFromAcbs(token: string, searchText: string): Promise<AcbsGetPartiesBySearchTextResponse> {
    const onlyWhitespaces = /^\s*$/;

    if (searchText === null) {
      throw new GetPartiesBySearchTextException('The required query parameter searchText was not specified.');
    }

    if (searchText === '') {
      throw new GetPartiesBySearchTextException('The query parameter searchText must be non-empty.');
    }

    if (typeof searchText === 'string' && searchText.length < 3) {
      throw new GetPartiesBySearchTextException('The query parameter searchText must be at least 3 characters.');
    }

    if (onlyWhitespaces.test(searchText)) {
      throw new GetPartiesBySearchTextException('The query parameter searchText cannot contain only whitespaces.');
    }

    const acbsRequest = {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };

    const response = await lastValueFrom(
      this.httpService.get<AcbsGetPartiesBySearchTextResponse>(`${PartyService.getPartiesBySearchTextPath}/${searchText}`, acbsRequest),
    )
      .then((acbsResponse) => acbsResponse.data)
      .catch((error) => {
        throw new GetPartiesBySearchTextException('Failed to get parties from ACBS.', error);
      });

    return response;
  }

  async getPartiesBySearchText(token: string, searchText: string): Promise<GetPartiesBySearchTextResponse> {
    const response = await this.getPartiesBySearchTextFromAcbs(token, searchText).then((partiesFromAcbs) =>
      partiesFromAcbs.map((party) => ({
        alternateIdentifier: party.PartyAlternateIdentifier,
        industryClassification: party.IndustryClassification.IndustryClassificationCode,
        name1: party.PartyName1,
        name2: party.PartyName2,
        name3: party.PartyName3,
        smeType: party.MinorityClass.MinorityClassCode,
        citizenshipClass: party.CitizenshipClass.CitizenshipClassCode,
        officerRiskDate: this.dateStringTransformations.removeTimeIfExists(party.OfficerRiskDate),
        countryCode: party.PrimaryAddress.Country.CountryCode,
      })),
    );

    return response;
  }

  async getPartyIdentifierBySearchText(token: string, searchText: string): Promise<CreatePartyResponse> {
    const response = await this.getPartiesBySearchTextFromAcbs(token, searchText).then((partiesFromAcbs) => {
      return partiesFromAcbs[0] ? (partiesFromAcbs[0].PartyIdentifier ? { partyIdentifier: partiesFromAcbs[0].PartyIdentifier } : {}) : undefined;
    });

    return response;
  }

  async createParty(token: string, party: CreatePartyRequestItem): Promise<{ partyIdentifier: string }> {
    const acbsRequest = {
      PartyAlternateIdentifier: party.alternateIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: party.industryClassification,
      },
      PartyName1: party.name1,
      PartyName2: party.name2 ?? '',
      PartyName3: party.name3 ?? '',
      PartyShortName: party.name1.substring(0, 15),
      PartySortName: party.name1.substring(0, 20),
      PartyType: {
        PartyTypeCode: PROPERTIES.PARTY.DEFAULT.partyTypeCode,
      },
      PrimaryAddress: {
        AddressIdentifier: PROPERTIES.PARTY.DEFAULT.address.addressIdentifier,
        AddressName1: PROPERTIES.PARTY.DEFAULT.address.addressName1,
        AddressType: {
          AddressTypeCode: PROPERTIES.PARTY.DEFAULT.address.addressTypeCode,
        },
        Country: {
          CountryCode: party.countryCode ?? PROPERTIES.PARTY.DEFAULT.address.countryCode,
        },
      },
      DefaultGeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: PROPERTIES.PARTY.DEFAULT.generalLedgerUnitIdentifier,
      },
      CitizenshipClass: {
        CitizenshipClassCode: party.citizenshipClass,
      },
      OfficerRiskDate: this.dateStringTransformations.addTimeToDateOnlyString(party.officerRiskDate),
      RiskRating: {
        RiskRatingCode: PROPERTIES.PARTY.DEFAULT.riskRatingCode,
      },
      PrimaryOfficer: {
        LineOfficerIdentifier: PROPERTIES.PARTY.DEFAULT.lineOfficerIdentifier,
      },
      SecondaryOfficer: {
        LineOfficerIdentifier: PROPERTIES.PARTY.DEFAULT.lineOfficerIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: PROPERTIES.PARTY.DEFAULT.servicingUnitSectionIdentifier,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: PROPERTIES.PARTY.DEFAULT.servicingUnitIdentifier,
      },
      PartyUserDefinedList1: {
        PartyUserDefinedList1Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList1Code,
      },
      PartyUserDefinedList2: {
        PartyUserDefinedList2Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList2Code,
      },
      PartyUserDefinedList3: {
        PartyUserDefinedList3Code: PROPERTIES.PARTY.DEFAULT.partyUserDefinedList3Code,
      },
      MinorityClass: {
        MinorityClassCode: party.smeType,
      },
      PartyStatus: {
        PartyStatusCode: PROPERTIES.PARTY.DEFAULT.partyStatusCode,
      },
      DefaultLanguage: {
        LanguageCode: PROPERTIES.PARTY.DEFAULT.languageCode,
      },
      WatchListReason: {
        WatchListReasonCode: PROPERTIES.PARTY.DEFAULT.watchListReasonCode ?? '',
      },
    };

    const acbsRequestConfig = {
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    };

    const response = await lastValueFrom(this.httpService.post<never>(PartyService.createPartyPath, acbsRequest, acbsRequestConfig))
      .then((acbsResponse) => {
        const locationHeader = acbsResponse.headers.location;
        const indexOfLastSlash = locationHeader.lastIndexOf('/');
        const partyIdentifier = locationHeader.substring(indexOfLastSlash + 1);
        return {
          partyIdentifier: partyIdentifier,
        };
      })
      .catch((error) => {
        throw new CreatePartyInAcbsFailedException('Failed to create party in ACBS.', error);
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
      officerRiskDate: this.dateStringTransformations.removeTimeIfExists(partyInAcbs.OfficerRiskDate),
      countryCode: partyInAcbs.PrimaryAddress.Country.CountryCode,
    };
  }
}

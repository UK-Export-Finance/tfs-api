import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { AcbsPartyService } from '@ukef/modules/acbs/acbs-party.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

import { DateStringTransformations } from '../date/date-string.transformations';
import { AcbsCreatePartyRequest } from './dto/acbs-create-party-request.dto';
import { AcbsGetPartiesBySearchTextResponse } from './dto/acbs-get-parties-by-search-text-response.dto';
import { CreatePartyRequestItem } from './dto/create-party-request.dto';
import { CreatePartyResponse } from './dto/create-party-response.dto';
import { GetPartiesBySearchTextResponse } from './dto/get-parties-by-search-text-response.dto';
import { GetPartiesBySearchTextException } from './exception/get-parties-by-search-text.exception';
import { Party } from './party.interface';

@Injectable()
export class PartyService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsPartyService: AcbsPartyService,
    private readonly dateStringTransformations: DateStringTransformations,
  ) {}

  async getPartiesBySearchTextFromAcbs(searchText: string): Promise<AcbsGetPartiesBySearchTextResponse> {
    const token = await this.getIdToken();
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

    return await this.acbsPartyService.getPartyBySearchText(searchText, token);
  }

  async getPartiesBySearchText(searchText: string): Promise<GetPartiesBySearchTextResponse> {
    const response = await this.getPartiesBySearchTextFromAcbs(searchText).then((partiesFromAcbs) =>
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

  async getPartyIdentifierBySearchText(searchText: string): Promise<CreatePartyResponse> {
    const response = await this.getPartiesBySearchTextFromAcbs(searchText).then((partiesFromAcbs) => {
      let party = undefined;
      if (partiesFromAcbs[0]) {
        party = partiesFromAcbs[0].PartyIdentifier ? { partyIdentifier: partiesFromAcbs[0].PartyIdentifier } : {};
      }
      return party;
    });

    return response;
  }

  async createParty(partyToCreate: CreatePartyRequestItem): Promise<CreatePartyResponse> {
    const token = await this.getIdToken();
    const newPartyInAcbs: AcbsCreatePartyRequest = this.buildAcbsCreatePartyRequest(partyToCreate);

    return this.acbsPartyService.createParty(newPartyInAcbs, token);
  }

  async getPartyByIdentifier(partyIdentifier: string): Promise<Party> {
    const idToken = await this.getIdToken();
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

  private getIdToken(): Promise<string> {
    return this.acbsAuthenticationService.getIdToken();
  }

  private buildAcbsCreatePartyRequest(partyToCreate: CreatePartyRequestItem): AcbsCreatePartyRequest {
    return {
      PartyAlternateIdentifier: partyToCreate.alternateIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: partyToCreate.industryClassification,
      },
      PartyName1: partyToCreate.name1,
      PartyName2: partyToCreate.name2 ?? '',
      PartyName3: partyToCreate.name3 ?? '',
      PartyShortName: partyToCreate.name1.substring(0, 15),
      PartySortName: partyToCreate.name1.substring(0, 20),
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
          CountryCode: partyToCreate.countryCode ?? PROPERTIES.PARTY.DEFAULT.address.countryCode,
        },
      },
      DefaultGeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: PROPERTIES.PARTY.DEFAULT.generalLedgerUnitIdentifier,
      },
      CitizenshipClass: {
        CitizenshipClassCode: partyToCreate.citizenshipClass,
      },
      OfficerRiskDate: this.dateStringTransformations.addTimeToDateOnlyString(partyToCreate.officerRiskDate),
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
        MinorityClassCode: partyToCreate.smeType,
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
  }
}

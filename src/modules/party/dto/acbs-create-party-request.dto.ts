import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsCreatePartyRequest {
  PartyAlternateIdentifier: string;
  IndustryClassification: {
    IndustryClassificationCode: string;
  };
  PartyName1: string;
  PartyName2: string;
  PartyName3: string;
  PartyShortName: string;
  PartySortName: string;
  PartyType: {
    PartyTypeCode: string;
  };
  PrimaryAddress: {
    AddressIdentifier: string;
    AddressName1: string;
    AddressType: {
      AddressTypeCode: string;
    };
    Country: {
      CountryCode: string;
    };
  };
  DefaultGeneralLedgerUnit: {
    GeneralLedgerUnitIdentifier: string;
  };
  CitizenshipClass: {
    CitizenshipClassCode: string;
  };
  OfficerRiskDate: DateString | null;
  RiskRating: {
    RiskRatingCode: string;
  };
  PrimaryOfficer: {
    LineOfficerIdentifier: string;
  };
  SecondaryOfficer: {
    LineOfficerIdentifier: string;
  };
  ServicingUnitSection: {
    ServicingUnitSectionIdentifier: string;
  };
  ServicingUnit: {
    ServicingUnitIdentifier: string;
  };
  PartyUserDefinedList1: {
    PartyUserDefinedList1Code: string;
  };
  PartyUserDefinedList2: {
    PartyUserDefinedList2Code: string;
  };
  PartyUserDefinedList3: {
    PartyUserDefinedList3Code: string;
  };
  MinorityClass: {
    MinorityClassCode: string;
  };
  PartyStatus: {
    PartyStatusCode: string;
  };
  DefaultLanguage: {
    LanguageCode: string;
  };
  WatchListReason: {
    WatchListReasonCode: string;
  };
}

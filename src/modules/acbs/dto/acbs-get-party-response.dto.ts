import { DateString } from '@ukef/helpers/date-string.type';

export type AcbsGetPartyResponseDto = AcbsGetPartyResponseItem[];

export interface AcbsGetPartyResponseItem {
  PartyAlternateIdentifier: string;
  IndustryClassification: { IndustryClassificationCode: string };
  PartyName1: string;
  PartyName2: string;
  PartyName3: string;
  MinorityClass: { MinorityClassCode: string };
  CitizenshipClass: { CitizenshipClassCode: string };
  OfficerRiskDate: DateString;
  PrimaryAddress: { Country: { CountryCode: string } };
}

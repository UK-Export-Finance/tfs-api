import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsGetPartyResponseDto {
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

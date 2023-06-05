export type AcbsGetPartiesBySearchTextResponseDto = AcbsGetPartiesBySearchTextResponseItem[];

export interface AcbsGetPartiesBySearchTextResponseItem {
  PartyIdentifier: string;
  PartyAlternateIdentifier: string;
  IndustryClassification: { IndustryClassificationCode: string };
  PartyName1: string;
  PartyName2: string;
  PartyName3: string;
  MinorityClass: { MinorityClassCode: string };
  CitizenshipClass: { CitizenshipClassCode: string };
  OfficerRiskDate: string;
  PrimaryAddress: { Country: { CountryCode: string } };
}

export interface AcbsGetPartiesBySearchTextResponseElement {
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

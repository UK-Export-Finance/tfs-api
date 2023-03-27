import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsCreateFacilityPartyDto {
  FacilityStatus: {
    FacilityStatusCode: string;
  };
  InvolvedParty: {
    PartyIdentifier: string;
  };
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  LenderType: {
    LenderTypeCode: string;
  };
  SectionIdentifier: string;
  Currency: {
    CurrencyCode: string;
  };
  LimitAmount: number;
  CustomerAdvisedIndicator: boolean;
  LimitRevolvingIndicator: boolean;
}

import { DateString } from '@ukef/helpers';

export interface AcbsCreateDealInvestorRequest {
  SectionIdentifier: string;
  EffectiveDate: DateString;
  ExpirationDate: DateString | null;
  IsExpirationDateMaximum: boolean;
  LenderType: {
    LenderTypeCode: string;
  };
  InvolvedParty: {
    PartyIdentifier: string;
  };
  Currency: {
    CurrencyCode: string;
  };
  CustomerAdvisedIndicator: boolean;
  DealStatus: {
    DealStatusCode: string;
  };
  UserDefinedCode1: string;
  ContractPercentage: number;
  LimitRevolvingIndicator: boolean;
}

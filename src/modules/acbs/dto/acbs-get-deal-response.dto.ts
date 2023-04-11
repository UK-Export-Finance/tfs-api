import { DateString } from '@ukef/helpers';

export interface AcbsGetDealResponseDto {
  DealIdentifier: string;
  PortfolioIdentifier: string;
  Currency: {
    CurrencyCode: string;
  };
  OriginalEffectiveDate: DateString;
  MemoLimitAmount: number;
  IndustryClassification: {
    IndustryClassificationCode: string;
  };
  BorrowerParty: {
    PartyName1: string;
    PartyIdentifier: string;
  };
}

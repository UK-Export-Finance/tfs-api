import { DateString } from '@ukef/helpers';

export type AcbsGetDealResponseDto = {
  DealIdentifier: string;
  PortfolioIdentifier: string;
  Currency: {
    CurrencyCode: string;
  };
  OriginalEffectiveDate: DateString;
  MemoLimitAmount: number;
  IndustryClassification: {
    IndustryClassificationCode: string | null;
  };
  BorrowerParty: {
    PartyName1: string | null;
    PartyIdentifier: string;
  };
};

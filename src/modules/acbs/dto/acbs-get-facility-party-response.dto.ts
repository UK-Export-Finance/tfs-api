import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityPartyResponseDto = {
  EffectiveDate: DateString;
  Currency: {
    CurrencyCode: string;
  };
  ExpirationDate: DateString;
  LimitAmount: number;
  LenderType: {
    LenderTypeCode: string;
  };
  InvolvedParty: {
    PartyIdentifier: string;
  };
};

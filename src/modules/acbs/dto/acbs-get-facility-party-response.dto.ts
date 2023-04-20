import { DateString } from '@ukef/helpers';

export interface AcbsGetFacilityPartyResponseDto {
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
}

import { DateString } from '@ukef/helpers/date-string.type';

/**
 * UKEF calls this record Deal Investor.
 */
export type AcbsGetDealPartyResponseDto = {
  EffectiveDate: DateString;
  ExpirationDate?: DateString;
  IsExpirationDateMaximum: boolean;
  LenderType: { LenderTypeCode: string };
  LimitAmount: number;
};

import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityFixedFeeResponseDto = AcbsGetFacilityFixedFeeResponseItem[];

export interface AcbsGetFacilityFixedFeeResponseItem {
  FixedFeeAmount: number;
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  NextDueDate: DateString;
  NextAccrueToDate: DateString;
  SegmentIdentifier: string;
  Description: string;
  Currency: {
    CurrencyCode: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  IncomeClass: {
    IncomeClassCode: string;
  };
}

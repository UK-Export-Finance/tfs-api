import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityFixedFeeResponseDto = AcbsGetFacilityFixedFeeResponseItem[];

export type AcbsGetFacilityFixedFeeResponseItem = {
  FixedFeeAmount: number;
  CurrentPayoffAmount: number;
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
};

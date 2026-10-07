import { AcbsPartyId, DateString, UkefId } from '@ukef/helpers';

export type FacilityFeeAmountTransaction = {
  $type: 'FacilityFeeAmountTransaction';
  AccountOwnerIdentifier: string;
  EffectiveDate: DateString;
  FacilityIdentifier: UkefId;
  FacilityFeeTransactionType: {
    TypeCode: number;
  };
  IsDraftIndicator: boolean;
  LenderType: {
    LenderTypeCode: string;
  };
  LimitKeyValue: AcbsPartyId;
  LimitType: {
    LimitTypeCode: string;
  };
  SectionIdentifier: string;
  SegmentIdentifier: string;
  TransactionAmount: number;
};

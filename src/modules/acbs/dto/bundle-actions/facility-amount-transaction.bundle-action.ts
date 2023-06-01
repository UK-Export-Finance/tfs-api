import { BundleInformationType } from '@ukef/constants/enums/bundle-information-type';
import { DateString } from '@ukef/helpers';

export interface FacilityAmountTransaction {
  $type: BundleInformationType.FACILITY_AMOUNT_TRANSACTION;
  AccountOwnerIdentifier: string;
  EffectiveDate: DateString;
  FacilityIdentifier: string;
  FacilityTransactionType: {
    TypeCode: string;
  };
  IsDraftIndicator: boolean;
  LenderType: {
    LenderTypeCode: string;
  };
  LimitKeyValue: string;
  LimitType: {
    LimitTypeCode: string;
  };
  SectionIdentifier: string;
  TransactionAmount: number;
}

import { BundleInformationType } from '@ukef/constants/enums/bundle-information-type';
import { DateString } from '@ukef/helpers';

export interface LoanAdvanceTransaction {
  $type: BundleInformationType.LOAN_ADVANCE_TRANSACTION;
  EffectiveDate: DateString;
  LoanIdentifier: string;
  TransactionTypeCode: string;
  IsDraftIndicator: boolean;
  LoanAdvanceAmount: number;
  CashOffsetTypeCode: string;
}

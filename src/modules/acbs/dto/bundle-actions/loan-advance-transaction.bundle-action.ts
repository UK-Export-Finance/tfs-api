import { DateString } from '@ukef/helpers';

export interface LoanAdvanceTransaction {
  $type: 'LoanAdvanceTransaction';
  EffectiveDate: DateString;
  LoanIdentifier: string;
  TransactionTypeCode: string;
  IsDraftIndicator: boolean;
  LoanAdvanceAmount: number;
  CashOffsetTypeCode: string;
}

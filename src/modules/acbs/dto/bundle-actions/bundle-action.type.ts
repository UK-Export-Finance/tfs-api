import { DateString } from '@ukef/helpers';

import { AccrualSchedule } from './accrual-schedule.interface';
import { RepaymentSchedule } from './repayment-schedule.interface';

export type BundleAction =
  | AccrualScheduleAmountTransaction
  | AccrualScheduleCodeValueTransaction
  | AccrualScheduleRateTransaction
  | IncomeExpenseAmountTransaction
  | NewLoanInfo
  | CreditArrangementPaymentInfo
  | CreditArrangementPayment
  | FacilityPayment
  | DealFeeAmountTransaction
  | DealFeeCodeValueTransaction
  | DealFeeRateTransaction
  | DealAmountTransaction
  | DealCodeValueTransaction
  | LoanAmountTransaction
  | FacilityAmountTransaction
  | FacilityCodeValueTransaction
  | FacilityFeeAmountTransaction
  | FacilityFeeCodeValueTransaction
  | FacilityFeeRateTransaction
  | LoanAdvanceTransaction
  | FacilityPaymentInfo
  | FlatFeeScheduleTransaction
  | LoanRolloverRenewalTransaction
  | LoanPayment
  | LoanPaymentInfo
  | NewLoanRequest;

interface AccrualScheduleAmountTransaction {
  $type: 'AccrualScheduleAmountTransaction';
}

interface AccrualScheduleCodeValueTransaction {
  $type: 'AccrualScheduleCodeValueTransaction';
}

interface AccrualScheduleRateTransaction {
  $type: 'AccrualScheduleRateTransaction';
}

interface IncomeExpenseAmountTransaction {
  $type: 'IncomeExpenseAmountTransaction';
}

interface NewLoanInfo {
  $type: 'NewLoanInfo';
}

interface CreditArrangementPaymentInfo {
  $type: 'CreditArrangementPaymentInfo';
}

interface CreditArrangementPayment {
  $type: 'CreditArrangementPayment';
}

interface FacilityPayment {
  $type: 'FacilityPayment';
}

interface DealFeeAmountTransaction {
  $type: 'DealFeeAmountTransaction';
}

interface DealFeeCodeValueTransaction {
  $type: 'DealFeeCodeValueTransaction';
}

interface DealFeeRateTransaction {
  $type: 'DealFeeRateTransaction';
}

interface DealAmountTransaction {
  $type: 'DealAmountTransaction';
}

interface DealCodeValueTransaction {
  $type: 'DealCodeValueTransaction';
}

interface LoanAmountTransaction {
  $type: 'LoanAmountTransaction';
}

interface FacilityAmountTransaction {
  $type: 'FacilityAmountTransaction';
}

interface FacilityCodeValueTransaction {
  $type: 'FacilityCodeValueTransaction';
}

interface FacilityFeeAmountTransaction {
  $type: 'FacilityFeeAmountTransaction';
}

interface FacilityFeeCodeValueTransaction {
  $type: 'FacilityFeeCodeValueTransaction';
}

interface FacilityFeeRateTransaction {
  $type: 'FacilityFeeRateTransaction';
}

interface LoanAdvanceTransaction {
  $type: 'LoanAdvanceTransaction';
}

interface FlatFeeScheduleTransaction {
  $type: 'FlatFeeScheduleTransaction';
}

interface LoanRolloverRenewalTransaction {
  $type: 'LoanRolloverRenewalTransaction';
}

interface LoanPayment {
  $type: 'LoanPayment';
}

interface LoanPaymentInfo {
  $type: 'LoanPaymentInfo';
}

interface FacilityPaymentInfo {
  $type: 'FacilityPaymentInfo';
}

interface NewLoanRequest {
  $type: 'NewLoanRequest';
  FacilityIdentifier: string;
  BorrowerPartyIdentifier: string;
  Currency: {
    CurrencyCode: string;
  };
  DealCustomerUsageRate: number | null;
  DealCustomerUsageOperationType: {
    OperationTypeCode: string | null;
  };
  LoanAmount: number;
  EffectiveDate: DateString;
  MaturityDate: DateString;
  ProductGroup: {
    ProductGroupCode: string;
  };
  ProductType: {
    ProductTypeCode: string;
  };
  AccrualScheduleList: AccrualSchedule[];
  RepaymentScheduleList: RepaymentSchedule[];
}

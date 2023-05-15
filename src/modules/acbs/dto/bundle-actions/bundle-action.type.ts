import { PROPERTIES } from '@ukef/constants';
import { DateString } from '@ukef/helpers';

import { AccrualSchedule } from './accrual-schedule.interface';
import { RepaymentSchedule } from './repayment-schedule.interface';

export type BundleAction = NewLoanRequest | { $type: string };

export const isNewLoanRequest = (bundleAction: BundleAction): bundleAction is NewLoanRequest => {
  return bundleAction.$type === PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.$type.newLoanRequest;
};

export interface NewLoanRequest {
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

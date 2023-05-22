import { DateString } from '@ukef/helpers';

import { AccrualSchedule } from './accrual-schedule.interface';
import { RepaymentSchedule } from './repayment-schedule.interface';

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

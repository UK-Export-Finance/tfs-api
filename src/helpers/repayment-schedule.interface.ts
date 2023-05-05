import { DateString } from './date-string.type';

export interface RepaymentSchedule {
  NextDueDate: DateString;
  LoanBillingFrequencyType: {
    LoanBillingFrequencyTypeCode: string;
  };
}

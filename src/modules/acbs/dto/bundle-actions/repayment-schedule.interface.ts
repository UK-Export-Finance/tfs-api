import { DateString } from '@ukef/helpers';

export interface RepaymentSchedule {
  NextDueDate: DateString;
  LoanBillingFrequencyType: {
    LoanBillingFrequencyTypeCode: string;
  };
}

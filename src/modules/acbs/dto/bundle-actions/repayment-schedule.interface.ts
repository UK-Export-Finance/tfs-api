import { DateString } from '@ukef/helpers';

export interface RepaymentSchedule {
  PrimaryScheduleIndicator: string;
  InvolvedParty: {
    PartyIdentifier: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  AccountSequence: string;
  BillingScheduleType: {
    BillingScheduleTypeCode: string;
  };
  BillingCalendar: {
    CalendarIdentifier: string;
  };
  LoanBillingFrequencyType: {
    LoanBillingFrequencyTypeCode: string;
  },
  NextDueDate: DateString;
  BillingDueCycleDay: number;
  NextAccrueToDate: DateString;
  BillingAccrueToCycleDay: number;
  LeadDays: number;
  NextDueBusinessDayAdjustmentType: {
    LoanSystemBusinessDayAdjustmentTypeCode: string;
  };
  NextAccrueBusinessDayAdjustmentType: {
    LoanSystemBusinessDayAdjustmentTypeCode: string;
  },
  BillingPeriod: number;
  BalanceCategory?: {
    BalanceCategoryCode: string;
  };
  CollectionInstructionMethod: {
    CollectionInstructionMethodCode: string;
  },
  BillFormatType: {
    BillFormatTypeCode: string;
  },
  MailingInstructionType: {
    MailingInstructionTypeCode: string;
  },
  SpreadToInvestorsIndicator: boolean;
  BalloonPaymentAmount: number;
  NumberOfBillsToPrint?: number;
  LoanPrePaymentType: {
    LoanPrePaymentTypeCode: number;
  };
  PercentageOfBalance?: number;
  PaymentAmount?: number;
  BillingSequenceNumber: number;
}

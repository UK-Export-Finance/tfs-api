import { DateString } from '@ukef/helpers';

import { AccrualSchedule } from './accrual-schedule.interface';
import { RepaymentSchedule } from './repayment-schedule.interface';

export interface NewLoanRequest {
  $type: 'NewLoanRequest';
  FacilityIdentifier: string;
  BorrowerPartyIdentifier: string;
  SectionIdentifier: string;
  LoanInstrumentCode: string;
  Currency: {
    CurrencyCode: string;
  };
  DealCustomerUsageRate?: number | null;
  DealCustomerUsageOperationType?: {
    OperationTypeCode: string | null;
  };
  LoanAmount: number;
  EffectiveDate: DateString;
  RateSettingDate: DateString;
  RateMaturityDate: DateString;
  MaturityDate: DateString;
  ServicingUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  AdministrativeUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  ServicingUnit: {
    ServicingUnitIdentifier: string;
  };
  ServicingUnitSection: {
    ServicingUnitSectionIdentifier: string;
  };
  ClosureType: {
    ClosureTypeCode: string;
  };
  AgentPartyIdentifier: string;
  AgentAddressIdentifier: string;
  InterestRateType: {
    InterestRateTypeCode: string;
  };
  BookingType: {
    LoanBookingTypeCode: string;
  };
  LoanReviewFrequencyType: {
    LoanReviewFrequencyTypeCode: string;
  };
  CurrentRiskOfficerIdentifier: string;
  ProductGroup: {
    ProductGroupCode: string;
  };
  ProductType: {
    ProductTypeCode: string;
  };
  LoanAdvanceType: {
    LoanAdvanceTypeCode: string;
  };
  GeneralLedgerUnit: {
    GeneralLedgerUnitIdentifier: string;
  };
  CashEventList: NewLoanRequestCashEvent[];
  SecuredType: {
    LoanSecuredTypeCode: string;
  };
  FinancialRateGroup?: string;
  CustomerUsageRateGroup?: string;
  FinancialFrequency?: {
    UsageFrequencyTypeCode: string;
  };
  CustomerUsageFrequency?: {
    UsageFrequencyTypeCode: string;
  };
  FinancialBusinessDayAdjustment?: {
    BusinessDayAdjustmentTypeCode: string;
  };
  CustomerUsageBusinessDayAdjustment?: {
    BusinessDayAdjustmentTypeCode: string;
  };
  FinancialCalendar?: {
    CalendarIdentifier: string;
  };
  CustomerUsageCalendar?: {
    CalendarIdentifier: string;
  };
  FinancialNextValuationDate?: DateString;
  CustomerUsageNextValuationDate?: DateString;
  FinancialLockMTMRateIndicator?: boolean;
  CustomerUsageLockMTMRateIndicator?: boolean;
  AccrualScheduleList: AccrualSchedule[];
  RepaymentScheduleList: Pick<RepaymentSchedule, 'NextDueDate' | 'LoanBillingFrequencyType'>[];
}

interface NewLoanRequestCashEvent {
  PaymentInstructionCode: string;
  CashOffsetTypeCode: string;
  Currency: {
    CurrencyCode: string;
  };
  SettlementCurrencyCode: string;
  OriginatingGeneralLedgerUnit: string;
  DDAAccount: string;
  CashDetailAmount: number;
  CashReferenceIdentifier: string;
}

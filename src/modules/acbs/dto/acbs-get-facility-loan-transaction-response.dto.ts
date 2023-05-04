import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityLoanTransactionResponseDto = AcbsGetFacilityLoanTransactionResponseItem[];

interface AccrualSchedule {
  AccrualCategory: {
    AccrualCategoryCode: string;
  };
  SpreadRate: number;
  YearBasis: {
    YearBasisCode: string;
  };
  IndexRateChangeFrequency: {
    IndexRateChangeFrequencyCode: string;
  };
}

interface RepaymentSchedule {
  NextDueDate: DateString | null;
  LoanBillingFrequencyType: {
    LoanBillingFrequencyTypeCode: string;
  };
}

interface NewLoanRequest {
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

export interface AcbsGetFacilityLoanTransactionResponseItem {
  PortfolioIdentifier: string;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  PostingDate: DateString;
  BundleMessageList: (NewLoanRequest | any)[]; // TODO: change to discriminated union
}

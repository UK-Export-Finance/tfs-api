import { DateString } from '@ukef/helpers';

interface AccrualSchedule {
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

export interface AcbsGetLoanTransactionResponseDto {
  PortfolioIdentifier: string;
  BundleStatus: {
    BundleStatusCode: string;
    BundleStatusShortDescription: string;
  };
  PostingDate: DateString;
  BundleMessageList: (NewLoanRequest | any)[];
}

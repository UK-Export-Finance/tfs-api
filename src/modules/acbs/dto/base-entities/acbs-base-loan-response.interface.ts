import { DateString } from '@ukef/helpers';

export interface AcbsBaseLoan {
  PortfolioIdentifier: string;
  LoanIdentifier: string;
  ParentFacilityIdentifier: string;
  PrimaryParty: {
    PartyIdentifier: string;
  };
  Currency: {
    CurrencyCode: string;
  };
  PrincipalBalance: number;
  InterestBalance: number;
  FeeBalance: number;
  OtherBalance: number;
  DiscountedPrincipal: number;
  EffectiveDate: DateString;
  MaturityDate: DateString;
  ProductGroup: {
    ProductGroupCode: string;
  };
  ProductType: {
    ProductTypeCode: string;
  };
  RateMaturityDate: DateString;
  IsRateMaturityDateZero: boolean;
  FinancialNextValuationDate?: DateString;
  CustomerUsageNextValuationDate?: DateString;
}

import { DateString } from '@ukef/helpers';

export type AcbsGetFacilityLoanResponseDto = AcbsGetFacilityLoanResponseItem[];

export interface AcbsGetFacilityLoanResponseItem {
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
}

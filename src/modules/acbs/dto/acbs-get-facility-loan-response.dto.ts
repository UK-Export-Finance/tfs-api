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
  ProductGroupCode: string; // TODO APIM-126: deprecated as of 12-01-24 (use ProductGroup.ProductGroupCode instead), but will API be retired by then anyway?
  ProductType: {
    ProductTypeCode: string;
  };
}

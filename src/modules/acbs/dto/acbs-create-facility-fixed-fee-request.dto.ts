import { AcbsPartyId, DateString } from '@ukef/helpers';

export interface AcbsCreateFacilityFixedFeeRequestDto {
  FixedFeeAmount: number;
  FixedFeeChargeType: {
    FixedFeeChargeTypeCode: string;
  };
  FixedFeeEarningMethod: {
    FixedFeeEarningMethodCode: string;
  };
  SectionIdentifier: string;
  LimitType: {
    LimitTypeCode: string;
  };
  LimitKey: AcbsPartyId;
  InvolvedParty: {
    PartyIdentifier: AcbsPartyId;
  };
  SegmentIdentifier: string;
  EffectiveDate: DateString;
  ExpirationDate: DateString;
  Currency: {
    CurrencyCode: string;
  };
  NextDueDate: DateString;
  LeadDays: number;
  NextAccrueToDate: DateString;
  FeeMail: {
    FeeMailCode: string;
  };
  AccountingMethod: {
    AccountingMethodCode: string;
  };
  FeeStartDateType: {
    FeeStartDateTypeCode: string;
  };
  BillingFrequencyType: {
    BillingFrequencyTypeCode: string;
  };
  Description: string;
  FeeStatus: {
    FeeStatusCode: string;
  };
  IncomeClass: {
    IncomeClassCode: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  BusinessDayAdjustmentType: {
    BusinessDayAdjustmentTypeCode: string;
  };
  AccrueToBusinessDayAdjustmentType: {
    BusinessDayAdjustmentTypeCode: string;
  };
  Calendar: {
    CalendarIdentifier: string;
  };
  FinancialCurrentFXRate: number;
  FinancialCurrentFXRateOperand: string;
  SpreadToInvestorsIndicator?: boolean;
}

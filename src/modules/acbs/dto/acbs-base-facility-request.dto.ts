import { DateString } from '@ukef/helpers';

export interface AcbsBaseFacilityRequest {
  FacilityIdentifier: string;
  Description: string;
  Currency: {
    CurrencyCode: string;
    IsActiveIndicator: boolean;
  };
  OriginalEffectiveDate: DateString;
  DealIdentifier: string;
  DealPortfolioIdentifier: string;
  DealBorrowerPartyIdentifier: string;
  BookingDate: DateString | null;
  FinalAvailableDate: DateString;
  IsFinalAvailableDateMaximum: boolean;
  ExpirationDate: DateString;
  IsExpirationDateMaximum: boolean;
  LimitAmount: number;
  ExternalReferenceIdentifier: string;
  BookingClass: {
    BookingClassCode: string;
  };
  FacilityType: {
    FacilityTypeCode: string;
  };
  TargetClosingDate: DateString;
  OriginalApprovalDate: DateString;
  CurrentOfficer: {
    LineOfficerIdentifier: string;
  };
  SecondaryOfficer: {
    LineOfficerIdentifier: string;
  };
  GeneralLedgerUnit: {
    GeneralLedgerUnitIdentifier: string;
  };
  ServicingUnit: {
    ServicingUnitIdentifier: string;
  };
  ServicingUnitSection: {
    ServicingUnitSectionIdentifier: string;
  };
  AgentBankPartyIdentifier: string;
  IndustryClassification: {
    IndustryClassificationCode: string;
  };
  RiskCountry: {
    CountryCode: string;
  };
  PurposeType: {
    PurposeTypeCode: string;
  };
  FacilityReviewFrequencyType: {
    FacilityReviewFrequencyTypeCode: string;
  };
  CapitalClass: {
    CapitalClassCode: string;
  };
  CapitalConversionFactor: {
    CapitalConversionFactorCode: string;
  };
  FinancialFXRate: number;
  FinancialFXRateOperand: string;
  FinancialRateFXRateGroup: string;
  FinancialFrequencyCode: string;
  FinancialBusinessDayAdjustment: string;
  FinancialDueMonthEndIndicator: boolean;
  FinancialCalendar: {
    CalendarIdentifier: string;
  };
  FinancialLockMTMRateIndicator: boolean;
  FinancialNextValuationDate: DateString;
  CustomerFXRateGroup: string;
  CustomerFrequencyCode: string;
  CustomerBusinessDayAdjustment: string;
  CustomerDueMonthEndIndicator: boolean;
  CustomerCalendar: {
    CalendarIdentifier: string;
  };
  CustomerLockMTMRateIndicator: boolean;
  CustomerNextValuationDate: DateString;
  LimitRevolvingIndicator: boolean;
  StandardReferenceType: ''; // We do not support sending a standard reference type.
  AdministrativeUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  CreditReviewRiskType: {
    CreditReviewRiskTypeCode: string;
  };
  NextReviewDate: DateString | null;
  IsNextReviewDateZero: boolean;
  OfficerRiskRatingType: {
    OfficerRiskRatingTypeCode: string;
  };
  OfficerRiskDate: DateString | null;
  IsOfficerRiskDateZero: boolean;
  CreditReviewRiskDate: DateString;
  IsCreditReviewRiskDateZero: boolean;
  RegulatorRiskDate: DateString;
  IsRegulatorRiskDateZero: boolean;
  MultiCurrencyArrangementIndicator: boolean;
  FacilityUserDefinedList1: {
    FacilityUserDefinedList1Code: string;
  };
  FacilityUserDefinedList3: {
    FacilityUserDefinedList3Code: string;
  };
  FacilityUserDefinedList6: {
    FacilityUserDefinedList6Code: string;
  };
  UserDefinedDate1: DateString | null;
  IsUserDefinedDate1Zero: boolean;
  UserDefinedDate2: DateString | null;
  IsUserDefinedDate2Zero: boolean;
  IsUserDefinedDate3Zero: boolean;
  IsUserDefinedDate4Zero: boolean;
  UserDefinedAmount3: number;
  ProbabilityofDefault: number;
  DefaultReason: {
    DefaultReasonCode: string;
  };
  DoubtfulPercent: number;
  DrawUnderTemplateIndicator: boolean;
  FacilityOrigination: {
    FacilityOriginationCode: string;
  };
  AccountStructure: {
    AccountStructureCode: string;
  };
  FacilityOverallStatus: {
    FacilityStatusCode: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  BorrowerParty: {
    PartyIdentifier: string;
  };
  ServicingUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  CompBalPctReserve: number;
  CompBalPctAmount: number;
  RiskMitigation: {
    RiskMitigationCode: string;
  };
}

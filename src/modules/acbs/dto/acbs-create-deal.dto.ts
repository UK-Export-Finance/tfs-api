import { DateString } from '@ukef/helpers/date-string.type';

export interface AcbsCreateDealDto {
  DealIdentifier: string;
  DealOrigination: {
    DealOriginationCode: string;
  };
  IsDealSyndicationIndicator: boolean;
  DealInitialStatus: {
    DealInitialStatusCode: string;
  };
  DealOverallStatus: {
    DealStatusCode: string;
  };
  DealType: {
    DealTypeCode: string;
  };
  DealReviewFrequencyType: {
    DealReviewFrequencyTypeCode: string;
  };
  PreviousDealPortfolioIdentifier: string;
  DealLegallyBindingIndicator: boolean;
  DealUserDefinedList5: {
    DealUserDefinedList5Code: string;
  };
  DealDefaultPaymentInstruction: null;
  DealExternalReferences: never[];
  PortfolioIdentifier: string;
  Description: string;
  Currency: {
    CurrencyCode: string;
    IsActiveIndicator: boolean;
  };
  OriginalEffectiveDate: DateString;
  BookingDate: DateString | null;
  FinalAvailableDate: DateString | null;
  IsFinalAvailableDateMaximum: boolean;
  ExpirationDate: DateString | null;
  IsExpirationDateMaximum: boolean;
  LimitAmount: number;
  WithheldAmount: number;
  MemoLimitAmount: number;
  BookingClass: {
    BookingClassCode: string;
  };
  TargetClosingDate: DateString;
  MemoUsedAmount: number;
  MemoAvailableAmount: number;
  MemoWithheldAmount: number;
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
  ServicingUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  AdministrativeUser: {
    UserAcbsIdentifier: string;
    UserName: string;
  };
  CreditReviewRiskType: {
    CreditReviewRiskTypeCode: string;
  };
  NextReviewDate: DateString;
  IsNextReviewDateZero: boolean;
  OfficerRiskRatingType: {
    OfficerRiskRatingTypeCode: string;
  };
  OfficerRiskDate: DateString;
  IsOfficerRiskDateZero: boolean;
  IsCreditReviewRiskDateZero: boolean;
  RegulatorRiskDate: DateString | null;
  IsRegulatorRiskDateZero: boolean;
  MultiCurrencyArrangementIndicator: boolean;
  IsUserDefinedDate1Zero: boolean;
  IsUserDefinedDate2Zero: boolean;
  IsUserDefinedDate3Zero: boolean;
  IsUserDefinedDate4Zero: boolean;
  SharedNationalCredit: string;
  DefaultReason: {
    DefaultReasonCode: string;
  };
  AccountStructure: {
    AccountStructureCode: string;
  };
  LenderType: {
    LenderTypeCode: string;
  };
  BorrowerParty: {
    PartyIdentifier: string;
  };
  RiskMitigation: {
    RiskMitigationCode: string;
  };
}

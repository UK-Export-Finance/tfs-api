import { ENUMS } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsCreateDealDto } from '@ukef/modules/acbs/dto/acbs-create-deal.dto';

import { RandomValueGenerator } from '../generator/random-value-generator';

export const generateAcbsCreateDealDtoUsing = (valueGenerator: RandomValueGenerator, { dealIdentifier }: { dealIdentifier: string }): AcbsCreateDealDto => ({
  DealIdentifier: dealIdentifier,
  DealOrigination: {
    DealOriginationCode: valueGenerator.string(),
  },
  IsDealSyndicationIndicator: valueGenerator.boolean(),
  DealInitialStatus: {
    DealInitialStatusCode: valueGenerator.string(),
  },
  DealOverallStatus: {
    DealStatusCode: valueGenerator.string(),
  },
  DealType: {
    DealTypeCode: valueGenerator.string(),
  },
  DealReviewFrequencyType: {
    DealReviewFrequencyTypeCode: valueGenerator.string(),
  },
  PreviousDealPortfolioIdentifier: valueGenerator.string(),
  DealLegallyBindingIndicator: valueGenerator.boolean(),
  DealUserDefinedList5: {
    DealUserDefinedList5Code: valueGenerator.string(),
  },
  DealDefaultPaymentInstruction: null,
  DealExternalReferences: [],
  PortfolioIdentifier: valueGenerator.string(),
  Description: valueGenerator.string(),
  Currency: {
    CurrencyCode: valueGenerator.string(),
    IsActiveIndicator: valueGenerator.boolean(),
  },
  OriginalEffectiveDate: valueGenerator.string(),
  BookingDate: valueGenerator.string(),
  FinalAvailableDate: valueGenerator.string(),
  IsFinalAvailableDateMaximum: valueGenerator.boolean(),
  ExpirationDate: valueGenerator.string(),
  IsExpirationDateMaximum: valueGenerator.boolean(),
  LimitAmount: valueGenerator.nonnegativeFloat(),
  WithheldAmount: valueGenerator.nonnegativeFloat(),
  MemoLimitAmount: valueGenerator.nonnegativeFloat(),
  BookingClass: {
    BookingClassCode: valueGenerator.string(),
  },
  TargetClosingDate: valueGenerator.string(),
  MemoUsedAmount: valueGenerator.nonnegativeFloat(),
  MemoAvailableAmount: valueGenerator.nonnegativeFloat(),
  MemoWithheldAmount: valueGenerator.nonnegativeFloat(),
  OriginalApprovalDate: valueGenerator.string(),
  CurrentOfficer: {
    LineOfficerIdentifier: valueGenerator.string(),
  },
  SecondaryOfficer: {
    LineOfficerIdentifier: valueGenerator.string(),
  },
  GeneralLedgerUnit: {
    GeneralLedgerUnitIdentifier: valueGenerator.string(),
  },
  ServicingUnit: {
    ServicingUnitIdentifier: valueGenerator.string(),
  },
  ServicingUnitSection: {
    ServicingUnitSectionIdentifier: valueGenerator.string(),
  },
  AgentBankPartyIdentifier: valueGenerator.string(),
  IndustryClassification: {
    IndustryClassificationCode: valueGenerator.string(),
  },
  RiskCountry: {
    CountryCode: valueGenerator.string(),
  },
  PurposeType: {
    PurposeTypeCode: valueGenerator.string(),
  },
  CapitalClass: {
    CapitalClassCode: valueGenerator.string(),
  },
  CapitalConversionFactor: {
    CapitalConversionFactorCode: valueGenerator.string(),
  },
  FinancialFXRate: valueGenerator.nonnegativeFloat(),
  FinancialFXRateOperand: valueGenerator.string(),
  FinancialRateFXRateGroup: valueGenerator.string(),
  FinancialFrequencyCode: valueGenerator.string(),
  FinancialBusinessDayAdjustment: valueGenerator.string(),
  FinancialDueMonthEndIndicator: valueGenerator.boolean(),
  FinancialCalendar: {
    CalendarIdentifier: valueGenerator.string(),
  },
  FinancialLockMTMRateIndicator: valueGenerator.boolean(),
  FinancialNextValuationDate: valueGenerator.string(),
  CustomerFXRateGroup: valueGenerator.string(),
  CustomerFrequencyCode: valueGenerator.string(),
  CustomerBusinessDayAdjustment: valueGenerator.string(),
  CustomerDueMonthEndIndicator: valueGenerator.boolean(),
  CustomerCalendar: {
    CalendarIdentifier: valueGenerator.string(),
  },
  CustomerLockMTMRateIndicator: valueGenerator.boolean(),
  CustomerNextValuationDate: valueGenerator.string(),
  LimitRevolvingIndicator: valueGenerator.boolean(),
  ServicingUser: {
    UserAcbsIdentifier: valueGenerator.string(),
    UserName: valueGenerator.string(),
  },
  AdministrativeUser: {
    UserAcbsIdentifier: valueGenerator.string(),
    UserName: valueGenerator.string(),
  },
  CreditReviewRiskType: {
    CreditReviewRiskTypeCode: valueGenerator.string(),
  },
  NextReviewDate: valueGenerator.string(),
  IsNextReviewDateZero: valueGenerator.boolean(),
  OfficerRiskRatingType: {
    OfficerRiskRatingTypeCode: valueGenerator.string(),
  },
  OfficerRiskDate: valueGenerator.string(),
  IsOfficerRiskDateZero: valueGenerator.boolean(),
  IsCreditReviewRiskDateZero: valueGenerator.boolean(),
  RegulatorRiskDate: valueGenerator.string(),
  IsRegulatorRiskDateZero: valueGenerator.boolean(),
  MultiCurrencyArrangementIndicator: valueGenerator.boolean(),
  IsUserDefinedDate1Zero: valueGenerator.boolean(),
  IsUserDefinedDate2Zero: valueGenerator.boolean(),
  IsUserDefinedDate3Zero: valueGenerator.boolean(),
  IsUserDefinedDate4Zero: valueGenerator.boolean(),
  SharedNationalCredit: valueGenerator.string(),
  DefaultReason: {
    DefaultReasonCode: valueGenerator.string(),
  },
  AccountStructure: {
    AccountStructureCode: valueGenerator.string(),
  },
  LenderType: {
    LenderTypeCode: valueGenerator.enumValue<LenderTypeCodeEnum>(ENUMS.LENDER_TYPE_CODES),
  },
  BorrowerParty: {
    PartyIdentifier: valueGenerator.string(),
  },
  RiskMitigation: {
    RiskMitigationCode: valueGenerator.string(),
  },
});

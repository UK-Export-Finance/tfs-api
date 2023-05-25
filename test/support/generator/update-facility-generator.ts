import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { AcbsUpdateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-update-facility-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { TEST_DATES } from '../constants/test-date.constant';
import { TEST_FACILITY_STAGE_CODE } from '../constants/test-issue-code.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class UpdateFacilityGenerator extends AbstractGenerator<FacilityValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator, protected readonly dateStringTransformations: DateStringTransformations) {
    super(valueGenerator);
  }

  protected generateValues(): FacilityValues {
    return {
      currency: TEST_CURRENCIES.A_TEST_CURRENCY,
      dealIdentifier: this.valueGenerator.dealId(),
      premiumFrequencyCode: this.valueGenerator.string({ maxLength: 1 }),
      riskCountryCode: this.valueGenerator.string({ maxLength: 3 }),
      obligorIndustryClassification: this.valueGenerator.string(),
      agentBankIdentifier: this.valueGenerator.acbsPartyId(),
      maximumLiability: this.valueGenerator.nonnegativeFloat(),
      exposurePeriod: this.valueGenerator.string({ maxLength: 12 }),
      dealBorrowerIdentifier: this.valueGenerator.acbsPartyId(),
      guaranteeExpiryDate: this.valueGenerator.dateOnlyString(),
      riskStatusCode: this.valueGenerator.string({ maxLength: 2 }),
      creditRatingCode: this.valueGenerator.string({ maxLength: 2 }),
      delegationType: this.valueGenerator.string({ maxLength: 4 }),
      interestOrFeeRate: this.valueGenerator.nonnegativeFloat(),
      probabilityOfDefault: this.valueGenerator.nonnegativeFloat(),
      obligorPartyIdentifier: this.valueGenerator.acbsPartyId(),
      forecastPercentage: this.valueGenerator.nonnegativeFloat(),
      issueDate: this.valueGenerator.dateOnlyString(),
      capitalConversionFactorCode: this.valueGenerator.string({ maxLength: 2 }),
      obligatorName: this.valueGenerator.string(),

      // Below are used for the getFacility request only
      description: this.valueGenerator.string(),
      facilityInitialStatusCode: this.valueGenerator.string(),
      administrativeUserIdentifier: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: FacilityValues[], options: GenerateOptions): GenerateResult {
    const { facilityIdentifier } = options;
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const [facilityToUpdate] = values;
    const facilityStageCode = TEST_FACILITY_STAGE_CODE.issuedFacilityStageCode;
    const productTypeId = this.valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);
    const productTypeName = 'The product';
    const effectiveDate = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
    const nextQuarterEndDate = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
    const midnightToday = this.dateStringTransformations.getDateStringFromDate(new Date());

    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);
    const acbsNextQuarterEndDate = this.dateStringTransformations.addTimeToDateOnlyString(nextQuarterEndDate);
    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToUpdate.guaranteeExpiryDate);

    const acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest = {
      FacilityIdentifier: facilityIdentifier,
      Description: facilityToUpdate.description,
      FacilityInitialStatus: { FacilityInitialStatusCode: facilityToUpdate.facilityInitialStatusCode },
      Currency: {
        CurrencyCode: facilityToUpdate.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: acbsEffectiveDate,
      DealIdentifier: facilityToUpdate.dealIdentifier,
      DealPortfolioIdentifier: portfolioIdentifier,
      DealBorrowerPartyIdentifier: facilityToUpdate.dealBorrowerIdentifier,
      BookingDate: midnightToday,
      FinalAvailableDate: acbsGuaranteeExpiryDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: acbsGuaranteeExpiryDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: facilityToUpdate.maximumLiability,
      ExternalReferenceIdentifier: facilityToUpdate.exposurePeriod,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      FacilityType: {
        FacilityTypeCode: productTypeId,
      },
      TargetClosingDate: acbsEffectiveDate,
      OriginalApprovalDate: acbsEffectiveDate,
      CurrentOfficer: {
        LineOfficerIdentifier: defaultValues.lineOfficerIdentifier,
      },
      SecondaryOfficer: {
        LineOfficerIdentifier: defaultValues.lineOfficerIdentifier,
      },
      GeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: defaultValues.generalLedgerUnitIdentifier,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: defaultValues.servicingUnitIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: defaultValues.servicingUnitSectionIdentifier,
      },
      AgentBankPartyIdentifier: facilityToUpdate.agentBankIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: facilityToUpdate.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: facilityToUpdate.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultValues.purposeTypeCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: facilityToUpdate.premiumFrequencyCode,
      },
      CapitalClass: {
        CapitalClassCode: defaultValues.capitalClassCode,
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: facilityToUpdate.capitalConversionFactorCode,
      },
      FinancialFXRate: defaultValues.financialFXRate,
      FinancialFXRateOperand: defaultValues.financialFXRateOperand,
      FinancialRateFXRateGroup: defaultValues.financialRateFXRateGroup,
      FinancialFrequencyCode: defaultValues.financialFrequencyCode,
      FinancialBusinessDayAdjustment: defaultValues.financialBusinessDayAdjustment,
      FinancialDueMonthEndIndicator: defaultValues.financialDueMonthEndIndicator,
      FinancialCalendar: {
        CalendarIdentifier: defaultValues.calendarIdentifier,
      },
      FinancialLockMTMRateIndicator: defaultValues.financialLockMTMRateIndicator,
      FinancialNextValuationDate: defaultValues.financialNextValuationDate,
      CustomerFXRateGroup: defaultValues.customerFXRateGroup,
      CustomerFrequencyCode: defaultValues.customerFrequencyCode,
      CustomerBusinessDayAdjustment: defaultValues.customerBusinessDayAdjustment,
      CustomerDueMonthEndIndicator: defaultValues.customerDueMonthEndIndicator,
      CustomerCalendar: {
        CalendarIdentifier: defaultValues.calendarIdentifier,
      },
      CustomerLockMTMRateIndicator: defaultValues.customerLockMTMRateIndicator,
      CustomerNextValuationDate: defaultValues.customerNextValuationDate,
      LimitRevolvingIndicator: defaultValues.limitRevolvingIndicator,
      StandardReferenceType: defaultValues.standardReferenceType,
      AdministrativeUser: {
        UserAcbsIdentifier: defaultValues.administrativeUser.userAcbsIdentifier,
        UserName: defaultValues.administrativeUser.userName,
      },
      CreditReviewRiskType: {
        CreditReviewRiskTypeCode: facilityToUpdate.riskStatusCode,
      },
      NextReviewDate: defaultValues.nextReviewDate,
      IsNextReviewDateZero: defaultValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: facilityToUpdate.creditRatingCode,
      },
      OfficerRiskDate: midnightToday,
      IsOfficerRiskDateZero: defaultValues.isOfficerRiskDateZero,
      CreditReviewRiskDate: midnightToday,
      IsCreditReviewRiskDateZero: defaultValues.isCreditReviewRiskDateZero,
      RegulatorRiskDate: defaultValues.regulatorRiskDate,
      IsRegulatorRiskDateZero: defaultValues.isRegulatorRiskDateZero,
      MultiCurrencyArrangementIndicator: defaultValues.multiCurrencyArrangementIndicator,
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: facilityStageCode,
      },
      FacilityUserDefinedList3: {
        FacilityUserDefinedList3Code: defaultValues.facilityUserDefinedList3Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: facilityToUpdate.delegationType,
      },
      UserDefinedDate1: this.dateStringTransformations.addTimeToDateOnlyString(facilityToUpdate.issueDate),
      IsUserDefinedDate1Zero: false,
      UserDefinedDate2: acbsNextQuarterEndDate,
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToUpdate.interestOrFeeRate,
      ProbabilityofDefault: facilityToUpdate.probabilityOfDefault,
      DefaultReason: {
        DefaultReasonCode: defaultValues.defaultReasonCode,
      },
      DoubtfulPercent: defaultValues.doubtfulPercent,
      DrawUnderTemplateIndicator: defaultValues.drawUnderTemplateIndicator,
      FacilityOrigination: {
        FacilityOriginationCode: defaultValues.facilityOriginationCode,
      },
      AccountStructure: {
        AccountStructureCode: defaultValues.accountStructureCode,
      },
      FacilityOverallStatus: {
        FacilityStatusCode: defaultValues.facilityStatusCode,
      },
      LenderType: {
        LenderTypeCode: defaultValues.lenderTypeCode,
      },
      BorrowerParty: {
        PartyIdentifier: facilityToUpdate.obligorPartyIdentifier,
      },
      ServicingUser: {
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      CompBalPctReserve: 100,
      CompBalPctAmount: facilityToUpdate.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };

    const updateFacilityRequest: UpdateFacilityRequest = {
      productTypeName,
      exposurePeriod: facilityToUpdate.exposurePeriod,
      currency: facilityToUpdate.currency,
      dealIdentifier: facilityToUpdate.dealIdentifier,
      dealBorrowerIdentifier: facilityToUpdate.dealBorrowerIdentifier,
      maximumLiability: facilityToUpdate.maximumLiability,
      productTypeId,
      agentBankIdentifier: facilityToUpdate.agentBankIdentifier,
      obligorIndustryClassification: facilityToUpdate.obligorIndustryClassification,
      riskCountryCode: facilityToUpdate.riskCountryCode,
      premiumFrequencyCode: facilityToUpdate.premiumFrequencyCode,
      capitalConversionFactorCode: facilityToUpdate.capitalConversionFactorCode,
      riskStatusCode: facilityToUpdate.riskStatusCode,
      creditRatingCode: facilityToUpdate.creditRatingCode,
      facilityStageCode,
      delegationType: facilityToUpdate.delegationType,
      issueDate: facilityToUpdate.issueDate,
      interestOrFeeRate: facilityToUpdate.interestOrFeeRate,
      probabilityOfDefault: facilityToUpdate.probabilityOfDefault,
      obligorPartyIdentifier: facilityToUpdate.obligorPartyIdentifier,
      forecastPercentage: facilityToUpdate.forecastPercentage,
      effectiveDate,
      nextQuarterEndDate,
      guaranteeExpiryDate: facilityToUpdate.guaranteeExpiryDate,
    };

    const acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto = {
      FacilityIdentifier: facilityIdentifier,
      Description: facilityToUpdate.description,
      Currency: { CurrencyCode: facilityToUpdate.currency },
      OriginalEffectiveDate: acbsEffectiveDate,
      DealIdentifier: facilityToUpdate.dealIdentifier,
      DealPortfolioIdentifier: portfolioIdentifier,
      DealBorrowerPartyIdentifier: facilityToUpdate.dealBorrowerIdentifier,
      ExpirationDate: acbsGuaranteeExpiryDate,
      LimitAmount: facilityToUpdate.maximumLiability,
      ExternalReferenceIdentifier: facilityToUpdate.exposurePeriod,
      FacilityType: { FacilityTypeCode: productTypeId },
      AgentBankPartyIdentifier: facilityToUpdate.agentBankIdentifier,
      IndustryClassification: { IndustryClassificationCode: facilityToUpdate.obligorIndustryClassification },
      RiskCountry: { CountryCode: facilityToUpdate.riskCountryCode },
      FacilityReviewFrequencyType: { FacilityReviewFrequencyTypeCode: facilityToUpdate.premiumFrequencyCode },
      CapitalConversionFactor: { CapitalConversionFactorCode: facilityToUpdate.capitalConversionFactorCode },
      CreditReviewRiskType: { CreditReviewRiskTypeCode: facilityToUpdate.riskStatusCode },
      OfficerRiskRatingType: { OfficerRiskRatingTypeCode: facilityToUpdate.creditRatingCode },
      FacilityUserDefinedList1: { FacilityUserDefinedList1Code: facilityStageCode },
      FacilityUserDefinedList6: { FacilityUserDefinedList6Code: facilityToUpdate.delegationType },
      UserDefinedDate1: this.dateStringTransformations.addTimeToDateOnlyString(facilityToUpdate.issueDate),
      UserDefinedDate2: acbsNextQuarterEndDate,
      UserDefinedAmount3: facilityToUpdate.interestOrFeeRate,
      ProbabilityofDefault: facilityToUpdate.probabilityOfDefault,
      FacilityOverallStatus: { FacilityStatusCode: defaultValues.facilityStatusCode },
      BorrowerParty: { PartyIdentifier: facilityToUpdate.obligorPartyIdentifier, PartyName1: facilityToUpdate.obligatorName },
      CompBalPctReserve: 100,
      CompBalPctAmount: facilityToUpdate.forecastPercentage,
      FacilityInitialStatus: {
        FacilityInitialStatusCode: facilityToUpdate.facilityInitialStatusCode,
      },
      AdministrativeUserIdentifier: facilityToUpdate.administrativeUserIdentifier,
    };

    return {
      acbsUpdateFacilityRequest,
      acbsGetExistingFacilityResponse,
      updateFacilityRequest: updateFacilityRequest,
    };
  }
}

interface FacilityValues {
  currency: string;
  dealIdentifier: UkefId;
  premiumFrequencyCode: string;
  riskCountryCode: string;
  obligorIndustryClassification: string;
  agentBankIdentifier: AcbsPartyId;
  maximumLiability: number;
  exposurePeriod: string;
  dealBorrowerIdentifier: AcbsPartyId;
  guaranteeExpiryDate: DateOnlyString;
  riskStatusCode: string;
  creditRatingCode: string;
  delegationType: string;
  interestOrFeeRate: number;
  probabilityOfDefault: number;
  obligorPartyIdentifier: AcbsPartyId;
  obligatorName: string;
  forecastPercentage: number;
  issueDate: DateOnlyString;
  capitalConversionFactorCode: string;
  description: string;
  facilityInitialStatusCode: string;
  administrativeUserIdentifier: string;
}

interface GenerateResult {
  acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest;
  acbsGetExistingFacilityResponse: AcbsGetFacilityResponseDto;
  updateFacilityRequest: UpdateFacilityRequest;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

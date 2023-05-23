import { PROPERTIES } from '@ukef/constants';
import { DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityRequestItem } from '@ukef/modules/facility/dto/create-facility-request.dto';

import { TEST_CURRENCIES } from '../constants/test-currency.constant';
import { TEST_DATES } from '../constants/test-date.constant';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityGenerator extends AbstractGenerator<FacilityValues, GenerateResult, GenerateOptions> {
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
    };
  }

  protected transformRawValuesToGeneratedValues(values: FacilityValues[], options: GenerateOptions): GenerateResult {
    const { facilityIdentifier } = options;
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const [facilityToCreate] = values;
    const facilityStageCode = '07';
    const productTypeId = '001';
    const productTypeName = 'The product';
    const effectiveDate = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
    const nextQuarterEndDate = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
    const midnightToday = this.dateStringTransformations.getDateStringFromDate(new Date());

    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);
    const acbsNextQuarterEndDate = this.dateStringTransformations.addTimeToDateOnlyString(nextQuarterEndDate);
    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToCreate.guaranteeExpiryDate);

    const acbsCreateFacilityRequest: AcbsCreateFacilityRequest = {
      FacilityIdentifier: facilityIdentifier,
      Description: `${productTypeName} : ${facilityToCreate.exposurePeriod} Months`,
      Currency: {
        CurrencyCode: facilityToCreate.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: acbsEffectiveDate,
      DealIdentifier: facilityToCreate.dealIdentifier,
      DealPortfolioIdentifier: portfolioIdentifier,
      DealBorrowerPartyIdentifier: facilityToCreate.dealBorrowerIdentifier,
      BookingDate: midnightToday,
      FinalAvailableDate: acbsGuaranteeExpiryDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: acbsGuaranteeExpiryDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: facilityToCreate.maximumLiability,
      ExternalReferenceIdentifier: facilityToCreate.exposurePeriod,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      FacilityType: {
        FacilityTypeCode: productTypeId,
      },
      TargetClosingDate: acbsEffectiveDate,
      FacilityInitialStatus: {
        FacilityInitialStatusCode: defaultValues.facilityInitialStatusCode,
      },
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
      AgentBankPartyIdentifier: facilityToCreate.agentBankIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: facilityToCreate.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: facilityToCreate.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultValues.purposeTypeCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: facilityToCreate.premiumFrequencyCode,
      },
      CapitalClass: {
        CapitalClassCode: defaultValues.capitalClassCode,
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: facilityToCreate.capitalConversionFactorCode,
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
        CreditReviewRiskTypeCode: facilityToCreate.riskStatusCode,
      },
      NextReviewDate: defaultValues.nextReviewDate,
      IsNextReviewDateZero: defaultValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: facilityToCreate.creditRatingCode,
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
        FacilityUserDefinedList6Code: facilityToCreate.delegationType,
      },
      UserDefinedDate1: this.dateStringTransformations.addTimeToDateOnlyString(facilityToCreate.issueDate),
      IsUserDefinedDate1Zero: false,
      UserDefinedDate2: acbsNextQuarterEndDate,
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToCreate.interestOrFeeRate,
      ProbabilityofDefault: facilityToCreate.probabilityOfDefault,
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
        PartyIdentifier: facilityToCreate.obligorPartyIdentifier,
      },
      ServicingUser: {
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      CompBalPctReserve: 100,
      CompBalPctAmount: facilityToCreate.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };

    const createFacilityRequestItem: CreateFacilityRequestItem = {
      facilityIdentifier,
      productTypeName,
      exposurePeriod: facilityToCreate.exposurePeriod,
      currency: facilityToCreate.currency,
      dealIdentifier: facilityToCreate.dealIdentifier,
      dealBorrowerIdentifier: facilityToCreate.dealBorrowerIdentifier,
      maximumLiability: facilityToCreate.maximumLiability,
      productTypeId,
      agentBankIdentifier: facilityToCreate.agentBankIdentifier,
      obligorIndustryClassification: facilityToCreate.obligorIndustryClassification,
      riskCountryCode: facilityToCreate.riskCountryCode,
      premiumFrequencyCode: facilityToCreate.premiumFrequencyCode,
      capitalConversionFactorCode: facilityToCreate.capitalConversionFactorCode,
      riskStatusCode: facilityToCreate.riskStatusCode,
      creditRatingCode: facilityToCreate.creditRatingCode,
      facilityStageCode,
      delegationType: facilityToCreate.delegationType,
      issueDate: facilityToCreate.issueDate,
      interestOrFeeRate: facilityToCreate.interestOrFeeRate,
      probabilityOfDefault: facilityToCreate.probabilityOfDefault,
      obligorPartyIdentifier: facilityToCreate.obligorPartyIdentifier,
      forecastPercentage: facilityToCreate.forecastPercentage,
      effectiveDate,
      nextQuarterEndDate,
      guaranteeExpiryDate: facilityToCreate.guaranteeExpiryDate,
    };

    return {
      acbsCreateFacilityRequest,
      createFacilityRequestItem,
    };
  }
}

interface FacilityValues {
  currency: string;
  dealIdentifier: UkefId;
  premiumFrequencyCode: string;
  riskCountryCode: string;
  obligorIndustryClassification: string;
  agentBankIdentifier: string;
  maximumLiability: number;
  exposurePeriod: string;
  dealBorrowerIdentifier: string;
  guaranteeExpiryDate: DateOnlyString;
  riskStatusCode: string;
  creditRatingCode: string;
  delegationType: string;
  interestOrFeeRate: number;
  probabilityOfDefault: number;
  obligorPartyIdentifier: string;
  forecastPercentage: number;
  issueDate: DateOnlyString;
  capitalConversionFactorCode: string;
}

interface GenerateResult {
  acbsCreateFacilityRequest: AcbsCreateFacilityRequest;
  createFacilityRequestItem: CreateFacilityRequestItem;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

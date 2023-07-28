import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId, DateOnlyString, UkefId } from '@ukef/helpers';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { AcbsUpdateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-update-facility-request.dto';
import { FacilityAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-amount-transaction.bundle-action';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { UpdateFacilityRequest } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
import { AbstractGenerator } from '@ukef-test/support/generator/abstract-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

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

    const defaultFacilityValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const defaultFacilityAmountTransactionValues = PROPERTIES.FACILITY_AMOUNT_TRANSACTION.DEFAULT;

    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(effectiveDate);
    const acbsNextQuarterEndDate = this.dateStringTransformations.addTimeToDateOnlyString(nextQuarterEndDate);
    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToUpdate.guaranteeExpiryDate);

    const description = `${productTypeName.substring(0, 13)} : ${facilityToUpdate.exposurePeriod} Months`;

    const acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest = {
      FacilityIdentifier: facilityIdentifier,
      Description: description,
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
      IsFinalAvailableDateMaximum: defaultFacilityValues.isFinalAvailableDateMaximum,
      ExpirationDate: acbsGuaranteeExpiryDate,
      IsExpirationDateMaximum: defaultFacilityValues.isExpirationDateMaximum,
      LimitAmount: facilityToUpdate.maximumLiability,
      ExternalReferenceIdentifier: facilityToUpdate.exposurePeriod,
      BookingClass: {
        BookingClassCode: defaultFacilityValues.bookingClassCode,
      },
      FacilityType: {
        FacilityTypeCode: productTypeId,
      },
      TargetClosingDate: acbsEffectiveDate,
      OriginalApprovalDate: acbsEffectiveDate,
      CurrentOfficer: {
        LineOfficerIdentifier: defaultFacilityValues.lineOfficerIdentifier,
      },
      SecondaryOfficer: {
        LineOfficerIdentifier: defaultFacilityValues.lineOfficerIdentifier,
      },
      GeneralLedgerUnit: {
        GeneralLedgerUnitIdentifier: defaultFacilityValues.generalLedgerUnitIdentifier,
      },
      ServicingUnit: {
        ServicingUnitIdentifier: defaultFacilityValues.servicingUnitIdentifier,
      },
      ServicingUnitSection: {
        ServicingUnitSectionIdentifier: defaultFacilityValues.servicingUnitSectionIdentifier,
      },
      AgentBankPartyIdentifier: facilityToUpdate.agentBankIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: facilityToUpdate.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: facilityToUpdate.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultFacilityValues.purposeTypeCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: facilityToUpdate.premiumFrequencyCode,
      },
      CapitalClass: {
        CapitalClassCode: defaultFacilityValues.capitalClassCode,
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: facilityToUpdate.capitalConversionFactorCode,
      },
      FinancialFXRate: defaultFacilityValues.financialFXRate,
      FinancialFXRateOperand: defaultFacilityValues.financialFXRateOperand,
      FinancialRateFXRateGroup: defaultFacilityValues.financialRateFXRateGroup,
      FinancialFrequencyCode: defaultFacilityValues.financialFrequencyCode,
      FinancialBusinessDayAdjustment: defaultFacilityValues.financialBusinessDayAdjustment,
      FinancialDueMonthEndIndicator: defaultFacilityValues.financialDueMonthEndIndicator,
      FinancialCalendar: {
        CalendarIdentifier: defaultFacilityValues.calendarIdentifier,
      },
      FinancialLockMTMRateIndicator: defaultFacilityValues.financialLockMTMRateIndicator,
      FinancialNextValuationDate: defaultFacilityValues.financialNextValuationDate,
      CustomerFXRateGroup: defaultFacilityValues.customerFXRateGroup,
      CustomerFrequencyCode: defaultFacilityValues.customerFrequencyCode,
      CustomerBusinessDayAdjustment: defaultFacilityValues.customerBusinessDayAdjustment,
      CustomerDueMonthEndIndicator: defaultFacilityValues.customerDueMonthEndIndicator,
      CustomerCalendar: {
        CalendarIdentifier: defaultFacilityValues.calendarIdentifier,
      },
      CustomerLockMTMRateIndicator: defaultFacilityValues.customerLockMTMRateIndicator,
      CustomerNextValuationDate: defaultFacilityValues.customerNextValuationDate,
      LimitRevolvingIndicator: defaultFacilityValues.limitRevolvingIndicator,
      StandardReferenceType: defaultFacilityValues.standardReferenceType,
      AdministrativeUser: {
        UserAcbsIdentifier: defaultFacilityValues.administrativeUser.userAcbsIdentifier,
        UserName: defaultFacilityValues.administrativeUser.userName,
      },
      CreditReviewRiskType: {
        CreditReviewRiskTypeCode: facilityToUpdate.riskStatusCode,
      },
      NextReviewDate: defaultFacilityValues.nextReviewDate,
      IsNextReviewDateZero: defaultFacilityValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: facilityToUpdate.creditRatingCode,
      },
      OfficerRiskDate: acbsEffectiveDate,
      IsOfficerRiskDateZero: defaultFacilityValues.isOfficerRiskDateZero,
      CreditReviewRiskDate: acbsEffectiveDate,
      IsCreditReviewRiskDateZero: defaultFacilityValues.isCreditReviewRiskDateZero,
      RegulatorRiskDate: defaultFacilityValues.regulatorRiskDate,
      IsRegulatorRiskDateZero: defaultFacilityValues.isRegulatorRiskDateZero,
      MultiCurrencyArrangementIndicator: defaultFacilityValues.multiCurrencyArrangementIndicator,
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: facilityStageCode,
      },
      FacilityUserDefinedList3: {
        FacilityUserDefinedList3Code: defaultFacilityValues.facilityUserDefinedList3Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: facilityToUpdate.delegationType,
      },
      UserDefinedDate1: this.dateStringTransformations.addTimeToDateOnlyString(facilityToUpdate.issueDate),
      IsUserDefinedDate1Zero: false,
      UserDefinedDate2: acbsNextQuarterEndDate,
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultFacilityValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultFacilityValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToUpdate.interestOrFeeRate,
      ProbabilityofDefault: facilityToUpdate.probabilityOfDefault,
      DefaultReason: {
        DefaultReasonCode: defaultFacilityValues.defaultReasonCode,
      },
      DoubtfulPercent: defaultFacilityValues.doubtfulPercent,
      DrawUnderTemplateIndicator: defaultFacilityValues.drawUnderTemplateIndicator,
      FacilityOrigination: {
        FacilityOriginationCode: defaultFacilityValues.facilityOriginationCode,
      },
      AccountStructure: {
        AccountStructureCode: defaultFacilityValues.accountStructureCode,
      },
      LenderType: {
        LenderTypeCode: defaultFacilityValues.lenderTypeCode,
      },
      BorrowerParty: {
        PartyIdentifier: facilityToUpdate.obligorPartyIdentifier,
      },
      ServicingUser: {
        UserAcbsIdentifier: defaultFacilityValues.servicingUser.userAcbsIdentifier,
        UserName: defaultFacilityValues.servicingUser.userName,
      },
      CompBalPctReserve: 100,
      CompBalPctAmount: facilityToUpdate.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultFacilityValues.riskMitigationCode,
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
      FacilityOverallStatus: { FacilityStatusCode: defaultFacilityValues.facilityStatusCode },
      BorrowerParty: { PartyIdentifier: facilityToUpdate.obligorPartyIdentifier, PartyName1: facilityToUpdate.obligatorName },
      CompBalPctReserve: 100,
      CompBalPctAmount: facilityToUpdate.forecastPercentage,
      FacilityInitialStatus: {
        FacilityInitialStatusCode: facilityToUpdate.facilityInitialStatusCode,
      },
      AdministrativeUserIdentifier: facilityToUpdate.administrativeUserIdentifier,
    };

    const acbsBundleInformationRequest: AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction> = {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: defaultFacilityAmountTransactionValues.initialBundleStatusCode,
      InitiatingUserName: defaultFacilityAmountTransactionValues.initiatingUserName,
      UseAPIUserIndicator: defaultFacilityAmountTransactionValues.useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: defaultFacilityAmountTransactionValues.bundleMessageList.type,
          AccountOwnerIdentifier: defaultFacilityAmountTransactionValues.bundleMessageList.accountOwnerIdentifier,
          EffectiveDate: acbsEffectiveDate,
          FacilityIdentifier: facilityIdentifier,
          FacilityTransactionType: { TypeCode: ENUMS.FACILITY_TRANSACTION_TYPE_CODES.MINUS },
          IsDraftIndicator: defaultFacilityAmountTransactionValues.bundleMessageList.isDraftIndicator,
          LenderType: { LenderTypeCode: defaultFacilityAmountTransactionValues.bundleMessageList.lenderTypeCode },
          LimitKeyValue: acbsGetExistingFacilityResponse.BorrowerParty.PartyIdentifier,
          LimitType: { LimitTypeCode: defaultFacilityAmountTransactionValues.bundleMessageList.limitType.limitTypeCode },
          SectionIdentifier: defaultFacilityAmountTransactionValues.bundleMessageList.sectionIdentifier,
          TransactionAmount: 0,
        },
      ],
    };

    return {
      acbsUpdateFacilityRequest,
      acbsGetExistingFacilityResponse,
      acbsBundleInformationRequest,
      updateFacilityRequest,
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
  acbsBundleInformationRequest: AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction>;
  updateFacilityRequest: UpdateFacilityRequest;
}

interface GenerateOptions {
  facilityIdentifier: UkefId;
}

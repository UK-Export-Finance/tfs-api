import { PROPERTIES } from '@ukef/constants';
import { DateOnlyString, DateString } from '@ukef/helpers';
import { AcbsCreateDealDto } from '@ukef/modules/acbs/dto/acbs-create-deal.dto';
import { AcbsUpdateDealBorrowingRestrictionRequest } from '@ukef/modules/acbs/dto/acbs-update-deal-borrowing-restriction-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateDealRequestItem } from '@ukef/modules/deal/dto/create-deal-request.dto';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateDealGenerator extends AbstractGenerator<DealValues, GenerateResult, GenerateOptions> {
  constructor(
    protected readonly valueGenerator: RandomValueGenerator,
    protected readonly dateStringTransformations: DateStringTransformations,
  ) {
    super(valueGenerator);
  }

  static getExpectedDescription({ obligorName, currency, formattedDate }: { obligorName: string; currency: string; formattedDate: string }): string {
    return `D: ${obligorName} ${currency} ${formattedDate}`;
  }

  protected generateValues(): DealValues {
    const guaranteeCommencementDateAsDate = new Date('2019-01-02T00:00:00Z');

    return {
      dealIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 10 }),
      currency: TEST_CURRENCIES.A_TEST_CURRENCY,
      dealValue: 123.45,
      guaranteeCommencementDateAsDate,
      guaranteeCommencementDateAsDateOnlyString: this.dateStringTransformations.getDateOnlyStringFromDate(guaranteeCommencementDateAsDate),
      guaranteeCommencementDateAsDateString: this.dateStringTransformations.getDateStringFromDate(guaranteeCommencementDateAsDate),
      guaranteeCommencementDateForDescription: '02/01/19',
      midnightToday: this.dateStringTransformations.getDateStringFromDate(new Date()),
      obligorPartyIdentifier: this.valueGenerator.stringOfNumericCharacters({ length: 8 }),
      obligorName: this.valueGenerator.string({ maxLength: 19 }),
      obligorIndustryClassification: this.valueGenerator.string({ maxLength: 10 }),
    };
  }

  protected transformRawValuesToGeneratedValues(values: DealValues[], _options: GenerateOptions): GenerateResult {
    const [dealValues] = values;
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const createDealRequestItem: CreateDealRequestItem = {
      dealIdentifier: dealValues.dealIdentifier,
      currency: dealValues.currency,
      dealValue: dealValues.dealValue,
      guaranteeCommencementDate: dealValues.guaranteeCommencementDateAsDateOnlyString,
      obligorPartyIdentifier: dealValues.obligorPartyIdentifier,
      obligorName: dealValues.obligorName,
      obligorIndustryClassification: dealValues.obligorIndustryClassification,
    };

    const defaultValues = PROPERTIES.DEAL.DEFAULT;
    const acbsCreateDealRequest: AcbsCreateDealDto = {
      DealIdentifier: dealValues.dealIdentifier,
      DealOrigination: {
        DealOriginationCode: defaultValues.dealOriginationCode,
      },
      IsDealSyndicationIndicator: defaultValues.isDealSyndicationIndicator,
      DealInitialStatus: {
        DealInitialStatusCode: defaultValues.dealInitialStatusCode,
      },
      DealOverallStatus: {
        DealStatusCode: defaultValues.dealOverallStatusCode,
      },
      DealType: {
        DealTypeCode: defaultValues.dealTypeCode,
      },
      DealReviewFrequencyType: {
        DealReviewFrequencyTypeCode: defaultValues.dealReviewFrequencyTypeCode,
      },
      PreviousDealPortfolioIdentifier: defaultValues.previousDealPortfolioIdentifier,
      DealLegallyBindingIndicator: defaultValues.dealLegallyBindingIndicator,
      DealUserDefinedList5: {
        DealUserDefinedList5Code: defaultValues.dealUserDefinedList5Code,
      },
      DealDefaultPaymentInstruction: null,
      DealExternalReferences: [],
      PortfolioIdentifier: portfolioIdentifier,
      Description: CreateDealGenerator.getExpectedDescription({
        obligorName: dealValues.obligorName,
        currency: dealValues.currency,
        formattedDate: dealValues.guaranteeCommencementDateForDescription,
      }),
      Currency: {
        CurrencyCode: dealValues.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: dealValues.guaranteeCommencementDateAsDateString,
      BookingDate: defaultValues.bookingDate,
      FinalAvailableDate: defaultValues.finalAvailableDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: defaultValues.expirationDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: dealValues.dealValue,
      WithheldAmount: defaultValues.withheldAmount,
      MemoLimitAmount: defaultValues.memoLimitAmount,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      TargetClosingDate: dealValues.guaranteeCommencementDateAsDateString,
      MemoUsedAmount: defaultValues.memoUsedAmount,
      MemoAvailableAmount: defaultValues.memoAvailableAmount,
      MemoWithheldAmount: defaultValues.memoWithheldAmount,
      OriginalApprovalDate: dealValues.guaranteeCommencementDateAsDateString,
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
      AgentBankPartyIdentifier: defaultValues.agentBankPartyIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: dealValues.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: defaultValues.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultValues.purposeTypeCode,
      },
      CapitalClass: {
        CapitalClassCode: defaultValues.capitalClassCode,
      },
      CapitalConversionFactor: {
        CapitalConversionFactorCode: defaultValues.capitalConversionFactorCode,
      },
      FinancialFXRate: defaultValues.financialFXRate,
      FinancialFXRateOperand: defaultValues.financialFXRateOperand,
      FinancialRateFXRateGroup: defaultValues.financialRateFXRateGroup,
      FinancialFrequencyCode: defaultValues.financialFrequencyCode,
      FinancialBusinessDayAdjustment: defaultValues.financialBusinessDayAdjustment,
      FinancialDueMonthEndIndicator: defaultValues.financialDueMonthEndIndicator,
      FinancialCalendar: {
        CalendarIdentifier: defaultValues.financialcalendarIdentifier,
      },
      FinancialLockMTMRateIndicator: defaultValues.financialLockMTMRateIndicator,
      FinancialNextValuationDate: defaultValues.financialNextValuationDate,
      CustomerFXRateGroup: defaultValues.customerFXRateGroup,
      CustomerFrequencyCode: defaultValues.customerFrequencyCode,
      CustomerBusinessDayAdjustment: defaultValues.customerBusinessDayAdjustment,
      CustomerDueMonthEndIndicator: defaultValues.customerDueMonthEndIndicator,
      CustomerCalendar: {
        CalendarIdentifier: defaultValues.customerCalendarIdentifier,
      },
      CustomerLockMTMRateIndicator: defaultValues.customerLockMTMRateIndicator,
      CustomerNextValuationDate: defaultValues.customerNextValuationDate,
      LimitRevolvingIndicator: defaultValues.limitRevolvingIndicator,
      ServicingUser: {
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      AdministrativeUser: {
        UserAcbsIdentifier: defaultValues.administrativeUser.userAcbsIdentifier,
        UserName: defaultValues.administrativeUser.userName,
      },
      CreditReviewRiskType: {
        CreditReviewRiskTypeCode: defaultValues.creditReviewRiskTypeCode,
      },
      NextReviewDate: defaultValues.nextReviewDate,
      IsNextReviewDateZero: defaultValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: defaultValues.officerRiskRatingTypeCode,
      },
      OfficerRiskDate: dealValues.midnightToday,
      IsOfficerRiskDateZero: defaultValues.isOfficerRiskDateZero,
      IsCreditReviewRiskDateZero: defaultValues.isCreditReviewRiskDateZero,
      RegulatorRiskDate: defaultValues.regulatorRiskDate,
      IsRegulatorRiskDateZero: defaultValues.isRegulatorRiskDateZero,
      MultiCurrencyArrangementIndicator: defaultValues.multiCurrencyArrangementIndicator,
      IsUserDefinedDate1Zero: defaultValues.isUserDefinedDate1Zero,
      IsUserDefinedDate2Zero: defaultValues.isUserDefinedDate2Zero,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      SharedNationalCredit: defaultValues.sharedNationalCredit,
      DefaultReason: {
        DefaultReasonCode: defaultValues.defaultReasonCode,
      },
      AccountStructure: {
        AccountStructureCode: defaultValues.accountStructureCode,
      },
      LenderType: {
        LenderTypeCode: defaultValues.lenderTypeCode,
      },
      BorrowerParty: {
        PartyIdentifier: dealValues.obligorPartyIdentifier,
      },
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };

    const acbsUpdateDealBorrowingRestrictionRequest: AcbsUpdateDealBorrowingRestrictionRequest = this.buildAcbsUpdateDealBorrowingRestrictionRequest();

    return {
      acbsCreateDealRequest,
      acbsUpdateDealBorrowingRestrictionRequest,
      createDealRequestItem,
      guaranteeCommencementDateAsDate: dealValues.guaranteeCommencementDateAsDate,
      guaranteeCommencementDateString: dealValues.guaranteeCommencementDateAsDateString,
      guaranteeCommencementDateForDescription: dealValues.guaranteeCommencementDateForDescription,
    };
  }

  private buildAcbsUpdateDealBorrowingRestrictionRequest() {
    const borrowingRestrictionDefaultValues = PROPERTIES.DEAL_BORROWING_RESTRICTION.DEFAULT;
    const acbsUpdateDealBorrowingRestrictionRequest: AcbsUpdateDealBorrowingRestrictionRequest = {
      SequenceNumber: borrowingRestrictionDefaultValues.sequenceNumber,
      RestrictGroupCategory: {
        RestrictGroupCategoryCode: borrowingRestrictionDefaultValues.restrictGroupCategory.restrictGroupCategoryCode,
      },
      IncludingIndicator: borrowingRestrictionDefaultValues.includingIndicator,
      IncludeExcludeAllItemsIndicator: borrowingRestrictionDefaultValues.includeExcludeAllItemsIndicator,
    };
    return acbsUpdateDealBorrowingRestrictionRequest;
  }
}

interface DealValues {
  dealIdentifier: string;
  currency: string;
  dealValue: number;
  guaranteeCommencementDateAsDate: Date;
  guaranteeCommencementDateAsDateOnlyString: DateOnlyString;
  guaranteeCommencementDateAsDateString: DateString;
  guaranteeCommencementDateForDescription: string;
  midnightToday: string;
  obligorPartyIdentifier: string;
  obligorName: string;
  obligorIndustryClassification: string;
}

interface GenerateResult {
  acbsCreateDealRequest: AcbsCreateDealDto;
  acbsUpdateDealBorrowingRestrictionRequest: AcbsUpdateDealBorrowingRestrictionRequest;
  createDealRequestItem: CreateDealRequestItem;
  guaranteeCommencementDateAsDate: Date;
  guaranteeCommencementDateString: string;
  guaranteeCommencementDateForDescription: string;
}

type GenerateOptions = unknown;

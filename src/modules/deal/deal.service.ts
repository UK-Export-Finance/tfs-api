import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants/properties.constant';
import { DateString } from '@ukef/helpers';
import { roundTo2DecimalPlaces } from '@ukef/helpers/round-to-2-decimal-places.helper';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';
import { AcbsDealService } from '@ukef/modules/acbs/acbs-deal.service';
import { AcbsCreateDealDto } from '@ukef/modules/acbs/dto/acbs-create-deal.dto';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { DealToCreate } from './deal-to-create.interface';

@Injectable()
export class DealService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealService: AcbsDealService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async createDeal(dealToCreate: DealToCreate): Promise<void> {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

    const idToken = await this.acbsAuthenticationService.getIdToken();

    const requestBody: AcbsCreateDealDto = this.buildAcbsRequestBodyToCreateDeal(dealToCreate, portfolioIdentifier);
    await this.acbsDealService.createDeal(portfolioIdentifier, requestBody, idToken);
  }

  private buildAcbsRequestBodyToCreateDeal(dealToCreate: DealToCreate, portfolioIdentifier: string): AcbsCreateDealDto {
    const now = new Date();
    const todayAsDateString = this.dateStringTransformations.getDateStringFromDate(now);

    const guaranteeCommencementDate = new Date(dealToCreate.guaranteeCommencementDate);
    const effectiveDate = this.currentDateProvider.getEarliestDateFromTodayAnd(guaranteeCommencementDate);
    const effectiveDateAsDateString = this.dateStringTransformations.getDateStringFromDate(effectiveDate);

    const dealDescription = this.createDealDescription(dealToCreate.obligorName, dealToCreate.currency, effectiveDate);
    const limitAmount = roundTo2DecimalPlaces(dealToCreate.dealValue);
    const officerRiskDate = todayAsDateString;

    return this.buildAcbsRequestBodyToCreateDealFromDefaults({
      dealToCreate,
      portfolioIdentifier,
      dealDescription,
      limitAmount,
      effectiveDateAsDateString,
      officerRiskDate,
    });
  }

  private createDealDescription(obligorName: string, currency: string, effectiveDate: Date): string {
    return 'D: ' + obligorName.substring(0, 19) + ' ' + currency + ' ' + this.dateStringTransformations.getDisplayDateFromDate(effectiveDate);
  }

  private buildAcbsRequestBodyToCreateDealFromDefaults({
    dealToCreate,
    portfolioIdentifier,
    dealDescription,
    limitAmount,
    effectiveDateAsDateString,
    officerRiskDate,
  }: {
    dealToCreate: DealToCreate;
    portfolioIdentifier: string;
    dealDescription: string;
    limitAmount: number;
    effectiveDateAsDateString: DateString;
    officerRiskDate: DateString;
  }): AcbsCreateDealDto {
    const defaultValues = PROPERTIES.DEAL.DEFAULTS;

    return {
      DealIdentifier: dealToCreate.dealIdentifier,
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
      Description: dealDescription,
      Currency: {
        CurrencyCode: dealToCreate.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: effectiveDateAsDateString,
      BookingDate: defaultValues.bookingDate,
      FinalAvailableDate: defaultValues.finalAvailableDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: defaultValues.expirationDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: limitAmount,
      WithheldAmount: defaultValues.withheldAmount,
      MemoLimitAmount: defaultValues.memoLimitAmount,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      TargetClosingDate: effectiveDateAsDateString,
      MemoUsedAmount: defaultValues.memoUsedAmount,
      MemoAvailableAmount: defaultValues.memoAvailableAmount,
      MemoWithheldAmount: defaultValues.memoWithheldAmount,
      OriginalApprovalDate: effectiveDateAsDateString,
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
        IndustryClassificationCode: dealToCreate.obligorIndustryClassification,
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
      OfficerRiskDate: officerRiskDate,
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
        PartyIdentifier: dealToCreate.obligorPartyIdentifier,
      },
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };
  }
}

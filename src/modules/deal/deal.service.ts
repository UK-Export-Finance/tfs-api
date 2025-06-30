import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants/properties.constant';
import { DateOnlyString, DateString } from '@ukef/helpers';
import { roundTo2DecimalPlaces } from '@ukef/helpers/round-to-2-decimal-places.helper';
import { AcbsDealService } from '@ukef/modules/acbs/acbs-deal.service';
import { AcbsCreateDealDto } from '@ukef/modules/acbs/dto/acbs-create-deal.dto';
import { AcbsUpdateDealDto } from '@ukef/modules/acbs/dto/acbs-update-deal.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';

import { Deal } from './deal.interface';
import { DealBorrowingRestrictionService } from './deal-borrowing-restriction.service';
import { CreateDealRequestItem } from './dto/create-deal-request.dto';
import { UpdateDealRequestItem } from './dto/update-deal-request.dto';

@Injectable()
export class DealService {
  private readonly portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsDealService: AcbsDealService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
    private readonly dealBorrowingRestrictionService: DealBorrowingRestrictionService,
  ) {}

  async getDealByIdentifier(dealIdentifier: string): Promise<Deal> {
    const idToken = await this.getIdToken();
    const dealInAcbs = await this.acbsDealService.getDealByIdentifier(this.portfolioIdentifier, dealIdentifier, idToken);

    return {
      dealIdentifier: dealInAcbs.DealIdentifier,
      portfolioIdentifier: dealInAcbs.PortfolioIdentifier,
      currency: dealInAcbs.Currency.CurrencyCode,
      dealValue: dealInAcbs.MemoLimitAmount,
      guaranteeCommencementDate: this.dateStringTransformations.removeTimeIfExists(dealInAcbs.OriginalEffectiveDate),
      obligorPartyIdentifier: dealInAcbs.BorrowerParty.PartyIdentifier,
      obligorName: dealInAcbs.BorrowerParty.PartyName1 ?? '',
      obligorIndustryClassification: dealInAcbs.IndustryClassification.IndustryClassificationCode ?? '',
    };
  }

  async createDeal(deal: CreateDealRequestItem): Promise<void> {
    const idToken = await this.getIdToken();
    const requestBody: AcbsCreateDealDto = this.buildAcbsRequestBodyToCreateDeal(deal, this.portfolioIdentifier);

    await this.acbsDealService.createDeal(this.portfolioIdentifier, requestBody, idToken);
    return this.updateBorrowingRestrictionForNewDeal(deal.dealIdentifier);
  }

  async updateDeal(deal: UpdateDealRequestItem, dealIdentifier: string, guaranteeCommencement: DateOnlyString): Promise<void> {
    const idToken = await this.getIdToken();
    const requestBody: AcbsUpdateDealDto = this.buildAcbsRequestBodyToUpdateDeal(deal, dealIdentifier, guaranteeCommencement);

    return await this.acbsDealService.updateDeal(this.portfolioIdentifier, requestBody, idToken);
  }

  private getIdToken(): Promise<string> {
    return this.acbsAuthenticationService.getIdToken();
  }

  private buildAcbsRequestBodyToUpdateDeal(deal: UpdateDealRequestItem, dealIdentifier: string, guaranteeCommencement: DateOnlyString): AcbsUpdateDealDto {
    const guaranteeCommencementDate = new Date(guaranteeCommencement);
    const effectiveDate = this.currentDateProvider.getEarliestDateFromTodayAnd(guaranteeCommencementDate);
    const effectiveDateAsDateString = this.dateStringTransformations.getDateStringFromDate(effectiveDate);

    const limitAmount = roundTo2DecimalPlaces(deal.dealValue);

    return this.buildAcbsRequestBodyToUpdateDealFromDefaults({
      deal,
      dealIdentifier,
      limitAmount,
      effectiveDateAsDateString,
    });
  }

  private buildAcbsRequestBodyToCreateDeal(deal: CreateDealRequestItem, portfolioIdentifier: string): AcbsCreateDealDto {
    const now = new Date();
    const todayAsDateString = this.dateStringTransformations.getDateStringFromDate(now);

    const guaranteeCommencementDate = new Date(deal.guaranteeCommencementDate);
    const effectiveDate = this.currentDateProvider.getEarliestDateFromTodayAnd(guaranteeCommencementDate);
    const effectiveDateAsDateString = this.dateStringTransformations.getDateStringFromDate(effectiveDate);

    const dealDescription = this.createDealDescription(deal.obligorName, deal.currency, effectiveDate);
    const limitAmount = roundTo2DecimalPlaces(deal.dealValue);
    const officerRiskDate = todayAsDateString;

    return this.buildAcbsRequestBodyToCreateDealFromDefaults({
      deal,
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
    deal,
    portfolioIdentifier,
    dealDescription,
    limitAmount,
    effectiveDateAsDateString,
    officerRiskDate,
  }: {
    deal: CreateDealRequestItem;
    portfolioIdentifier: string;
    dealDescription: string;
    limitAmount: number;
    effectiveDateAsDateString: DateString;
    officerRiskDate: DateString;
  }): AcbsCreateDealDto {
    const defaultValues = PROPERTIES.DEAL.DEFAULT;

    return {
      DealIdentifier: deal.dealIdentifier,
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
        CurrencyCode: deal.currency,
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
        IndustryClassificationCode: deal.obligorIndustryClassification,
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
        PartyIdentifier: deal.obligorPartyIdentifier,
      },
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };
  }

  private buildAcbsRequestBodyToUpdateDealFromDefaults({
    deal,
    dealIdentifier,
    limitAmount,
    effectiveDateAsDateString,
  }: {
    deal: UpdateDealRequestItem;
    dealIdentifier: string;
    limitAmount: number;
    effectiveDateAsDateString: DateString;
  }): AcbsUpdateDealDto {
    const defaultValues = PROPERTIES.DEAL.DEFAULT;

    return {
      DealIdentifier: dealIdentifier,
      DealOrigination: {
        DealOriginationCode: defaultValues.dealOriginationCode,
      },
      DealType: {
        DealTypeCode: defaultValues.dealTypeCode,
      },
      Currency: {
        CurrencyCode: deal.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: effectiveDateAsDateString,
      BookingDate: defaultValues.bookingDate,
      OriginalApprovalDate: effectiveDateAsDateString,
      CurrentOfficer: {
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
      IndustryClassification: {
        IndustryClassificationCode: deal.obligorIndustryClassification,
      },
      CapitalClass: {
        CapitalClassCode: defaultValues.capitalClassCode,
      },
      AccountStructure: {
        AccountStructureCode: defaultValues.accountStructureCode,
      },
      BorrowerParty: {
        PartyIdentifier: deal.obligorPartyIdentifier,
      },
    };
  }

  private async updateBorrowingRestrictionForNewDeal(dealIdentifier: string): Promise<void> {
    try {
      await this.dealBorrowingRestrictionService.updateBorrowingRestrictionForDeal(dealIdentifier);
    } catch (error: unknown) {
      throw new InternalServerErrorException('Internal server error', {
        cause: error as Error,
        description: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    }
  }
}

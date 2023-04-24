import { Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { DateString } from '@ukef/helpers';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

import { AcbsCreateFacilityRequest } from '../acbs/dto/acbs-create-facility-request.dto';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { CreateFacilityRequestItem } from './dto/create-facility-request.dto';
import { GetFacilityByIdentifierResponseDto } from './dto/get-facility-by-identifier-response.dto';

@Injectable()
export class FacilityService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsFacilityService: AcbsFacilityService,
    private readonly dateStringTransformations: DateStringTransformations,
    private readonly currentDateProvider: CurrentDateProvider,
  ) {}

  async getFacilityByIdentifier(facilityIdentifier: string): Promise<GetFacilityByIdentifierResponseDto> {
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const facilityInAcbs = await this.acbsFacilityService.getFacilityByIdentifier(facilityIdentifier, idToken);
    return {
      dealIdentifier: facilityInAcbs.DealIdentifier,
      facilityIdentifier: facilityInAcbs.FacilityIdentifier,
      portfolioIdentifier: facilityInAcbs.DealPortfolioIdentifier,
      dealBorrowerIdentifier: facilityInAcbs.DealBorrowerPartyIdentifier,
      maximumLiability: facilityInAcbs.LimitAmount,
      productTypeId: facilityInAcbs.FacilityType.FacilityTypeCode,
      capitalConversionFactorCode: facilityInAcbs.CapitalConversionFactor.CapitalConversionFactorCode,
      currency: facilityInAcbs.Currency.CurrencyCode,
      guaranteeCommencementDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate2),
      guaranteeExpiryDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.ExpirationDate),
      nextQuarterEndDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate2),
      facilityInitialStatus: facilityInAcbs.FacilityInitialStatus.FacilityInitialStatusCode,
      facilityOverallStatus: facilityInAcbs.FacilityOverallStatus.FacilityStatusCode,
      delegationType: facilityInAcbs.FacilityUserDefinedList6.FacilityUserDefinedList6Code,
      interestOrFeeRate: facilityInAcbs.UserDefinedAmount3,
      facilityStageCode: facilityInAcbs.FacilityUserDefinedList1.FacilityUserDefinedList1Code,
      exposurePeriod: facilityInAcbs.ExternalReferenceIdentifier,
      creditRatingCode: facilityInAcbs.OfficerRiskRatingType.OfficerRiskRatingTypeCode,
      guaranteePercentage: facilityInAcbs.CompBalPctReserve ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctReserve,
      premiumFrequencyCode: facilityInAcbs.FacilityReviewFrequencyType.FacilityReviewFrequencyTypeCode,
      riskCountryCode: facilityInAcbs.RiskCountry.CountryCode,
      riskStatusCode: facilityInAcbs.CreditReviewRiskType.CreditReviewRiskTypeCode,
      effectiveDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.OriginalEffectiveDate),
      forecastPercentage: facilityInAcbs.CompBalPctAmount ?? PROPERTIES.FACILITY.DEFAULT.GET.compBalPctAmount,
      issueDate: this.dateStringTransformations.removeTimeIfExists(facilityInAcbs.UserDefinedDate1),
      description: facilityInAcbs.Description,
      agentBankIdentifier: facilityInAcbs.AgentBankPartyIdentifier,
      obligorPartyIdentifier: facilityInAcbs.BorrowerParty.PartyIdentifier,
      obligorName: facilityInAcbs.BorrowerParty.PartyName1,
      obligorIndustryClassification: facilityInAcbs.IndustryClassification.IndustryClassificationCode,
      probabilityOfDefault: facilityInAcbs.ProbabilityofDefault,
    };
  }

  async createFacility(facilityToCreate: CreateFacilityRequestItem): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();
    const newFacilityInAcbs = this.buildAcbsCreateFacilityRequest(facilityToCreate);
    await this.acbsFacilityService.createFacility(portfolioIdentifier, newFacilityInAcbs, idToken);
  }

  private buildAcbsCreateFacilityRequest(facilityToCreate: CreateFacilityRequestItem): AcbsCreateFacilityRequest {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;

    const { compBalPctReserve, userDefinedDate1, isUserDefinedDate1Zero } = this.buildFacilityStageDerivedValuesToCreate(facilityToCreate);

    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToCreate.guaranteeExpiryDate);
    const midnightToday = this.dateStringTransformations.getDateStringFromDate(new Date());

    const capitalConversionFactorCode =
      facilityToCreate.capitalConversionFactorCode ??
      defaultValues.capitalConversionFactorCode[facilityToCreate.productTypeId] ??
      defaultValues.capitalConversionFactorCodeFallback;

    const description = this.buildFacilityDescriptionToCreate(facilityToCreate);
    const effectiveDateString = this.getFacilityEffectiveDateToCreate(facilityToCreate);

    return {
      FacilityIdentifier: facilityToCreate.facilityIdentifier,
      Description: description,
      Currency: {
        CurrencyCode: facilityToCreate.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: effectiveDateString,
      DealIdentifier: facilityToCreate.dealIdentifier,
      DealPortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
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
        FacilityTypeCode: facilityToCreate.productTypeId,
      },
      TargetClosingDate: effectiveDateString,
      FacilityInitialStatus: {
        FacilityInitialStatusCode: defaultValues.facilityInitialStatusCode,
      },
      OriginalApprovalDate: effectiveDateString,
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
        CapitalConversionFactorCode: capitalConversionFactorCode,
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
        FacilityUserDefinedList1Code: facilityToCreate.facilityStageCode,
      },
      FacilityUserDefinedList3: {
        FacilityUserDefinedList3Code: defaultValues.facilityUserDefinedList3Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: facilityToCreate.delegationType,
      },
      UserDefinedDate1: userDefinedDate1,
      IsUserDefinedDate1Zero: isUserDefinedDate1Zero,
      UserDefinedDate2: this.dateStringTransformations.addTimeToDateOnlyString(facilityToCreate.nextQuarterEndDate),
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToCreate.interestOrFeeRate,
      ProbabilityofDefault: facilityToCreate.probabilityOfDefault ?? defaultValues.probabilityofDefault,
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
      CompBalPctReserve: compBalPctReserve,
      CompBalPctAmount: facilityToCreate.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };
  }

  private buildFacilityStageDerivedValuesToCreate(facilityToCreate: CreateFacilityRequestItem): {
    compBalPctReserve: number;
    userDefinedDate1: DateString;
    isUserDefinedDate1Zero: boolean;
  } {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const { facilityStageCode, issueDate } = facilityToCreate;
    const isFacilityUnissued = facilityStageCode === '06';
    return isFacilityUnissued
      ? {
          compBalPctReserve: defaultValues.compBalPctReserveUnissued,
          userDefinedDate1: null,
          isUserDefinedDate1Zero: true,
        }
      : {
          compBalPctReserve: defaultValues.compBalPctReserveIssued,
          userDefinedDate1: issueDate ? this.dateStringTransformations.addTimeToDateOnlyString(issueDate) : null,
          isUserDefinedDate1Zero: false,
        };
  }

  private buildFacilityDescriptionToCreate(facilityToCreate: CreateFacilityRequestItem): string {
    return `${facilityToCreate.productTypeName.substring(0, 13)} : ${facilityToCreate.exposurePeriod} Months`;
  }

  private getFacilityEffectiveDateToCreate(facilityToCreate: CreateFacilityRequestItem): DateString {
    const effectiveDateTime = this.currentDateProvider.getEarliestDateFromTodayAnd(
      new Date(this.dateStringTransformations.addTimeToDateOnlyString(facilityToCreate.effectiveDate)),
    );
    return this.dateStringTransformations.getDateStringFromDate(effectiveDateTime);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { PROPERTIES } from '@ukef/constants';
import { DateString } from '@ukef/helpers';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';

import { AcbsBaseFacilityRequest } from '../acbs/dto/acbs-base-facility-request.dto';
import { AcbsUpdateFacilityRequest } from '../acbs/dto/acbs-update-facility-request.dto';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { BaseFacilityRequestItemWithFacilityIdentifier } from './dto/base-facility-request.dto';
import { CreateFacilityRequestItem } from './dto/create-facility-request.dto';
import { GetFacilityByIdentifierResponseDto } from './dto/get-facility-by-identifier-response.dto';
import { UpdateFacilityRequest, UpdateFacilityRequestWithFacilityIdentifier } from './dto/update-facility-request.dto';

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
    const acbsCreateFacilityRequest = this.buildCreateAcbsFacilityRequest(facilityToCreate);
    await this.acbsFacilityService.createFacility(portfolioIdentifier, acbsCreateFacilityRequest, idToken);
  }

  async issueFacilityByIdentifier(facilityIdentifier: string, updateFacilityRequest: UpdateFacilityRequest): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();

    if (!updateFacilityRequest.issueDate) {
      throw new BadRequestException('Bad request', { description: 'Issue date is not present' });
    }

    if (this.isFacilityUnissued(updateFacilityRequest.facilityStageCode)) {
      throw new BadRequestException('Bad request', { description: 'Facility stage code is not issued' });
    }

    await this.buildReqestAndUpdateFacility(updateFacilityRequest, facilityIdentifier, idToken, portfolioIdentifier);
  }

  async amendFacilityExpiryDateByIdentifier(facilityIdentifier: string, updateFacilityRequest: UpdateFacilityRequest): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();

    await this.buildReqestAndUpdateFacility(updateFacilityRequest, facilityIdentifier, idToken, portfolioIdentifier);
  }

  private async buildReqestAndUpdateFacility(
    updateFacilityRequest: UpdateFacilityRequest,
    facilityIdentifier: string,
    idToken: string,
    portfolioIdentifier: string,
  ) {
    const acbsUpdateFacilityRequest: AcbsUpdateFacilityRequest = await this.buildAcbsUpdateFacilityRequest(updateFacilityRequest, facilityIdentifier, idToken);

    await this.acbsFacilityService.updateFacilityByIdentifier(portfolioIdentifier, acbsUpdateFacilityRequest, idToken);
  }

  private async buildAcbsUpdateFacilityRequest(updateFacilityRequest: UpdateFacilityRequest, facilityIdentifier: string, idToken: string) {
    const updateFacilityRequestWithFacilityIdentifier: UpdateFacilityRequestWithFacilityIdentifier = { ...updateFacilityRequest, facilityIdentifier };
    const acbsUpdateFacilityRequest = this.buildBaseAcbsFacilityRequest(updateFacilityRequestWithFacilityIdentifier);

    const existingAcbsFacilityData = await this.acbsFacilityService.getFacilityByIdentifier(facilityIdentifier, idToken);
    // Remove AdministrativeUserIdentifier as its a depreciated field and
    // causes issue with old facilities which were manually created using old adminstrative profile.
    delete existingAcbsFacilityData.AdministrativeUserIdentifier;

    const acbsMergedUpdateFacilityRequest: AcbsUpdateFacilityRequest = { ...existingAcbsFacilityData, ...acbsUpdateFacilityRequest };
    return acbsMergedUpdateFacilityRequest;
  }

  private buildCreateAcbsFacilityRequest(facilityToCreate: CreateFacilityRequestItem): AcbsCreateFacilityRequest {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const acbsBaseFacilityRequest = this.buildBaseAcbsFacilityRequest(facilityToCreate);
    const description = this.buildFacilityDescriptionToCreate(facilityToCreate.productTypeName, facilityToCreate.exposurePeriod);
    const facilityInitialStatus = { FacilityInitialStatusCode: defaultValues.facilityInitialStatusCode };
    return { ...acbsBaseFacilityRequest, Description: description, FacilityInitialStatus: facilityInitialStatus };
  }

  private buildBaseAcbsFacilityRequest(facilityToTranform: BaseFacilityRequestItemWithFacilityIdentifier): AcbsBaseFacilityRequest {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;

    const { compBalPctReserve, userDefinedDate1, isUserDefinedDate1Zero } = this.buildFacilityStageDerivedValuesToCreate(
      facilityToTranform.facilityStageCode,
      facilityToTranform.issueDate,
    );

    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToTranform.guaranteeExpiryDate);
    const midnightToday = this.dateStringTransformations.getDateStringFromDate(new Date());

    const capitalConversionFactorCode =
      facilityToTranform.capitalConversionFactorCode ??
      defaultValues.capitalConversionFactorCode[facilityToTranform.productTypeId] ??
      defaultValues.capitalConversionFactorCodeFallback;

    const effectiveDateString = this.dateStringTransformations.getEarliestDateFromTodayAndDateAsString(
      facilityToTranform.effectiveDate,
      this.currentDateProvider,
    );

    return {
      FacilityIdentifier: facilityToTranform.facilityIdentifier,
      Currency: {
        CurrencyCode: facilityToTranform.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: effectiveDateString,
      DealIdentifier: facilityToTranform.dealIdentifier,
      DealPortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      DealBorrowerPartyIdentifier: facilityToTranform.dealBorrowerIdentifier,
      BookingDate: midnightToday,
      FinalAvailableDate: acbsGuaranteeExpiryDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: acbsGuaranteeExpiryDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: facilityToTranform.maximumLiability,
      ExternalReferenceIdentifier: facilityToTranform.exposurePeriod,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      FacilityType: {
        FacilityTypeCode: facilityToTranform.productTypeId,
      },
      TargetClosingDate: effectiveDateString,
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
      AgentBankPartyIdentifier: facilityToTranform.agentBankIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: facilityToTranform.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: facilityToTranform.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultValues.purposeTypeCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: facilityToTranform.premiumFrequencyCode,
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
        CreditReviewRiskTypeCode: facilityToTranform.riskStatusCode,
      },
      NextReviewDate: defaultValues.nextReviewDate,
      IsNextReviewDateZero: defaultValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: facilityToTranform.creditRatingCode,
      },
      OfficerRiskDate: midnightToday,
      IsOfficerRiskDateZero: defaultValues.isOfficerRiskDateZero,
      CreditReviewRiskDate: midnightToday,
      IsCreditReviewRiskDateZero: defaultValues.isCreditReviewRiskDateZero,
      RegulatorRiskDate: defaultValues.regulatorRiskDate,
      IsRegulatorRiskDateZero: defaultValues.isRegulatorRiskDateZero,
      MultiCurrencyArrangementIndicator: defaultValues.multiCurrencyArrangementIndicator,
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: facilityToTranform.facilityStageCode,
      },
      FacilityUserDefinedList3: {
        FacilityUserDefinedList3Code: defaultValues.facilityUserDefinedList3Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: facilityToTranform.delegationType,
      },
      UserDefinedDate1: userDefinedDate1,
      IsUserDefinedDate1Zero: isUserDefinedDate1Zero,
      UserDefinedDate2: this.dateStringTransformations.addTimeToDateOnlyString(facilityToTranform.nextQuarterEndDate),
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToTranform.interestOrFeeRate,
      ProbabilityofDefault: facilityToTranform.probabilityOfDefault ?? defaultValues.probabilityofDefault,
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
        PartyIdentifier: facilityToTranform.obligorPartyIdentifier,
      },
      ServicingUser: {
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      CompBalPctReserve: compBalPctReserve,
      CompBalPctAmount: facilityToTranform.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };
  }

  private buildFacilityStageDerivedValuesToCreate(
    facilityStageCode: string,
    issueDate: string,
  ): {
    compBalPctReserve: number;
    userDefinedDate1: DateString;
    isUserDefinedDate1Zero: boolean;
  } {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    return this.isFacilityUnissued(facilityStageCode)
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

  private buildFacilityDescriptionToCreate(productTypeName: string, exposurePeriod: string): string {
    return `${productTypeName.substring(0, 13)} : ${exposurePeriod} Months`;
  }

  private isFacilityUnissued(facilityStageCode: string) {
    return facilityStageCode === '06';
  }
}

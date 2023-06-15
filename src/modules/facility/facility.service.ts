import { BadRequestException, Injectable } from '@nestjs/common';
import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateString, UkefId } from '@ukef/helpers';
import { AcbsBundleInformationService } from '@ukef/modules/acbs/acbs-bundle-information.service';
import { AcbsFacilityService } from '@ukef/modules/acbs/acbs-facility.service';
import { AcbsBaseFacilityRequest } from '@ukef/modules/acbs/dto/acbs-base-facility-request.dto';
import { AcbsCreateBundleInformationRequestDto } from '@ukef/modules/acbs/dto/acbs-create-bundle-information-request.dto';
import { AcbsCreateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-create-facility-request.dto';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { AcbsUpdateFacilityRequest } from '@ukef/modules/acbs/dto/acbs-update-facility-request.dto';
import { FacilityAmountTransaction } from '@ukef/modules/acbs/dto/bundle-actions/facility-amount-transaction.bundle-action';
import { AcbsAuthenticationService } from '@ukef/modules/acbs-authentication/acbs-authentication.service';
import { CurrentDateProvider } from '@ukef/modules/date/current-date.provider';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { BaseFacilityRequestItemWithFacilityIdentifier } from '@ukef/modules/facility/dto/base-facility-request.dto';
import { CreateFacilityRequestItem } from '@ukef/modules/facility/dto/create-facility-request.dto';
import { GetFacilityByIdentifierResponseDto } from '@ukef/modules/facility/dto/get-facility-by-identifier-response.dto';
import { UpdateFacilityRequest, UpdateFacilityRequestWithFacilityIdentifier } from '@ukef/modules/facility/dto/update-facility-request.dto';
import { UpdateFacilityBundleIdentifierResponse } from '@ukef/modules/facility/dto/update-facility-response.dto';

@Injectable()
export class FacilityService {
  constructor(
    private readonly acbsAuthenticationService: AcbsAuthenticationService,
    private readonly acbsBundleInformationService: AcbsBundleInformationService,
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

  async issueFacilityByIdentifier(facilityIdentifier: UkefId, updateFacilityRequest: UpdateFacilityRequest): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();

    if (!updateFacilityRequest.issueDate) {
      throw new BadRequestException('Bad request', { description: 'Issue date is not present' });
    }

    if (this.isFacilityUnissued(updateFacilityRequest.facilityStageCode)) {
      throw new BadRequestException('Bad request', { description: 'Facility stage code is not issued' });
    }

    await this.buildRequestAndUpdateFacility(updateFacilityRequest, facilityIdentifier, idToken, portfolioIdentifier);
  }

  async amendFacilityExpiryDateByIdentifier(facilityIdentifier: UkefId, updateFacilityRequest: UpdateFacilityRequest): Promise<void> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;
    const idToken = await this.acbsAuthenticationService.getIdToken();

    await this.buildRequestAndUpdateFacility(updateFacilityRequest, facilityIdentifier, idToken, portfolioIdentifier);
  }

  async amendFacilityAmountByIdentifier(
    facilityIdentifier: UkefId,
    updateFacilityRequest: UpdateFacilityRequest,
  ): Promise<UpdateFacilityBundleIdentifierResponse> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const existingFacilityData = await this.acbsFacilityService.getFacilityByIdentifier(facilityIdentifier, idToken);

    return await this.buildAmendFacilityAmountBundleInformationRequestAndCreateBundleInformation(updateFacilityRequest, existingFacilityData, idToken);
  }

  private async buildRequestAndUpdateFacility(
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
    const acbsUpdatedFacilityRequestFieldsForIssueAndAmendExpiryDate = this.updateAcbsFacilityRequestFieldsForIssueAndAmendExpiryDate(updateFacilityRequestWithFacilityIdentifier);

    const existingAcbsFacilityData = await this.acbsFacilityService.getFacilityByIdentifier(facilityIdentifier, idToken);
    // Remove AdministrativeUserIdentifier as its a depreciated field and
    // causes issue with old facilities which were manually created using old adminstrative profile.
    delete existingAcbsFacilityData.AdministrativeUserIdentifier;

    const acbsMergedUpdateFacilityRequest: AcbsUpdateFacilityRequest = { ...existingAcbsFacilityData, ...acbsUpdateFacilityRequest, ...acbsUpdatedFacilityRequestFieldsForIssueAndAmendExpiryDate };
    return acbsMergedUpdateFacilityRequest;
  }

  private buildCreateAcbsFacilityRequest(facilityToCreate: CreateFacilityRequestItem): AcbsCreateFacilityRequest {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;
    const acbsBaseFacilityRequest = this.buildBaseAcbsFacilityRequest(facilityToCreate);
    const description = this.buildFacilityDescription(facilityToCreate.productTypeName, facilityToCreate.exposurePeriod);
    const facilityInitialStatus = { FacilityInitialStatusCode: defaultValues.facilityInitialStatusCode };
    return { ...acbsBaseFacilityRequest, Description: description, FacilityInitialStatus: facilityInitialStatus };
  }

  private buildBaseAcbsFacilityRequest(facilityToTransform: BaseFacilityRequestItemWithFacilityIdentifier): AcbsBaseFacilityRequest {
    const defaultValues = PROPERTIES.FACILITY.DEFAULT.POST;

    const { compBalPctReserve, userDefinedDate1, isUserDefinedDate1Zero } = this.buildFacilityStageDerivedValuesToCreate(
      facilityToTransform.facilityStageCode,
      facilityToTransform.issueDate,
    );

    const acbsGuaranteeExpiryDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToTransform.guaranteeExpiryDate);
    const midnightToday = this.dateStringTransformations.getDateStringFromDate(new Date());

    const capitalConversionFactorCode =
      facilityToTransform.capitalConversionFactorCode ??
      defaultValues.capitalConversionFactorCode[facilityToTransform.productTypeId] ??
      defaultValues.capitalConversionFactorCodeFallback;

    const effectiveDateString = this.dateStringTransformations.getEarliestDateFromTodayAndDateAsString(
      facilityToTransform.effectiveDate,
      this.currentDateProvider,
    );

    return {
      FacilityIdentifier: facilityToTransform.facilityIdentifier,
      Currency: {
        CurrencyCode: facilityToTransform.currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: effectiveDateString,
      DealIdentifier: facilityToTransform.dealIdentifier,
      DealPortfolioIdentifier: PROPERTIES.GLOBAL.portfolioIdentifier,
      DealBorrowerPartyIdentifier: facilityToTransform.dealBorrowerIdentifier,
      BookingDate: midnightToday,
      FinalAvailableDate: acbsGuaranteeExpiryDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: acbsGuaranteeExpiryDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: facilityToTransform.maximumLiability,
      ExternalReferenceIdentifier: facilityToTransform.exposurePeriod,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      FacilityType: {
        FacilityTypeCode: facilityToTransform.productTypeId,
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
      AgentBankPartyIdentifier: facilityToTransform.agentBankIdentifier,
      IndustryClassification: {
        IndustryClassificationCode: facilityToTransform.obligorIndustryClassification,
      },
      RiskCountry: {
        CountryCode: facilityToTransform.riskCountryCode,
      },
      PurposeType: {
        PurposeTypeCode: defaultValues.purposeTypeCode,
      },
      FacilityReviewFrequencyType: {
        FacilityReviewFrequencyTypeCode: facilityToTransform.premiumFrequencyCode,
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
        CreditReviewRiskTypeCode: facilityToTransform.riskStatusCode,
      },
      NextReviewDate: defaultValues.nextReviewDate,
      IsNextReviewDateZero: defaultValues.isNextReviewDateZero,
      OfficerRiskRatingType: {
        OfficerRiskRatingTypeCode: facilityToTransform.creditRatingCode,
      },
      OfficerRiskDate: midnightToday,
      IsOfficerRiskDateZero: defaultValues.isOfficerRiskDateZero,
      CreditReviewRiskDate: midnightToday,
      IsCreditReviewRiskDateZero: defaultValues.isCreditReviewRiskDateZero,
      RegulatorRiskDate: defaultValues.regulatorRiskDate,
      IsRegulatorRiskDateZero: defaultValues.isRegulatorRiskDateZero,
      MultiCurrencyArrangementIndicator: defaultValues.multiCurrencyArrangementIndicator,
      FacilityUserDefinedList1: {
        FacilityUserDefinedList1Code: facilityToTransform.facilityStageCode,
      },
      FacilityUserDefinedList3: {
        FacilityUserDefinedList3Code: defaultValues.facilityUserDefinedList3Code,
      },
      FacilityUserDefinedList6: {
        FacilityUserDefinedList6Code: facilityToTransform.delegationType,
      },
      UserDefinedDate1: userDefinedDate1,
      IsUserDefinedDate1Zero: isUserDefinedDate1Zero,
      UserDefinedDate2: this.dateStringTransformations.addTimeToDateOnlyString(facilityToTransform.nextQuarterEndDate),
      IsUserDefinedDate2Zero: false,
      IsUserDefinedDate3Zero: defaultValues.isUserDefinedDate3Zero,
      IsUserDefinedDate4Zero: defaultValues.isUserDefinedDate4Zero,
      UserDefinedAmount3: facilityToTransform.interestOrFeeRate,
      ProbabilityofDefault: facilityToTransform.probabilityOfDefault ?? defaultValues.probabilityofDefault,
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
        PartyIdentifier: facilityToTransform.obligorPartyIdentifier,
      },
      ServicingUser: {
        UserAcbsIdentifier: defaultValues.servicingUser.userAcbsIdentifier,
        UserName: defaultValues.servicingUser.userName,
      },
      CompBalPctReserve: compBalPctReserve,
      CompBalPctAmount: facilityToTransform.forecastPercentage,
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };
  }

  private updateAcbsFacilityRequestFieldsForIssueAndAmendExpiryDate(facilityToTransform: BaseFacilityRequestItemWithFacilityIdentifier) {
    const description = this.buildFacilityDescription(facilityToTransform.productTypeName, facilityToTransform.exposurePeriod);
    const acbsEffectiveDate = this.dateStringTransformations.addTimeToDateOnlyString(facilityToTransform.effectiveDate);
    const acbsIssueDate = facilityToTransform.issueDate ? this.dateStringTransformations.addTimeToDateOnlyString(facilityToTransform.issueDate) : null;
    const { isUserDefinedDate1Zero } = this.buildFacilityStageDerivedValuesToCreate(
      facilityToTransform.facilityStageCode,
      facilityToTransform.issueDate,
    );
    return {
      Description: description,
      OfficerRiskDate: acbsEffectiveDate,
      CreditReviewRiskDate: acbsEffectiveDate,
      UserDefinedDate1: acbsIssueDate,
      IsUserDefinedDate1Zero: isUserDefinedDate1Zero,
    };
  }

  private async buildAmendFacilityAmountBundleInformationRequestAndCreateBundleInformation(
    updateFacilityRequest: UpdateFacilityRequest,
    existingFacilityData: AcbsGetFacilityResponseDto,
    idToken: string,
  ): Promise<UpdateFacilityBundleIdentifierResponse> {
    const bundleInformationToCreateInAcbs: AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction> =
      this.buildAmendFacilityAmountBundleInformationRequest(updateFacilityRequest, existingFacilityData);

    const { BundleIdentifier } = await this.acbsBundleInformationService.createBundleInformation(bundleInformationToCreateInAcbs, idToken);

    return { bundleIdentifier: BundleIdentifier };
  }

  private buildAmendFacilityAmountBundleInformationRequest(
    updateFacilityRequest: UpdateFacilityRequest,
    existingFacilityData: AcbsGetFacilityResponseDto,
  ): AcbsCreateBundleInformationRequestDto<FacilityAmountTransaction> {
    const { portfolioIdentifier } = PROPERTIES.GLOBAL;

    const {
      initialBundleStatusCode,
      initiatingUserName,
      useAPIUserIndicator,
      bundleMessageList: {
        type,
        accountOwnerIdentifier,
        isDraftIndicator,
        lenderTypeCode,
        limitType: { limitTypeCode },
        sectionIdentifier,
      },
    } = PROPERTIES.FACILITY_AMOUNT_TRANSACTION.DEFAULT;

    const { maximumLiability: newTransactionValue } = updateFacilityRequest;

    const {
      FacilityIdentifier: facilityIdentifier,
      BorrowerParty: { PartyIdentifier: limitKeyValue },
      OriginalEffectiveDate: effectiveDate,
      LimitAmount: oldTransactionValue,
    } = existingFacilityData;

    const transactionAmount = this.getUpdatedTransactionAmount(newTransactionValue, oldTransactionValue);
    const typeCode = this.getAmendFacilityTypeCode(newTransactionValue, oldTransactionValue);

    return {
      PortfolioIdentifier: portfolioIdentifier,
      InitialBundleStatusCode: initialBundleStatusCode,
      InitiatingUserName: initiatingUserName,
      UseAPIUserIndicator: useAPIUserIndicator,
      BundleMessageList: [
        {
          $type: type,
          AccountOwnerIdentifier: accountOwnerIdentifier,
          EffectiveDate: effectiveDate,
          FacilityIdentifier: facilityIdentifier as UkefId,
          FacilityTransactionType: {
            TypeCode: typeCode,
          },
          IsDraftIndicator: isDraftIndicator,
          LenderType: {
            LenderTypeCode: lenderTypeCode,
          },
          LimitKeyValue: limitKeyValue,
          LimitType: {
            LimitTypeCode: limitTypeCode,
          },
          SectionIdentifier: sectionIdentifier,
          TransactionAmount: transactionAmount,
        },
      ],
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

  private buildFacilityDescription(productTypeName: string, exposurePeriod: string): string {
    return `${productTypeName.substring(0, 13)} : ${exposurePeriod} Months`;
  }

  private isFacilityUnissued(facilityStageCode: string) {
    return facilityStageCode === '06';
  }

  private getAmendFacilityTypeCode(newTransactionValue: number, oldTransactionValue: number) {
    return newTransactionValue > oldTransactionValue ? ENUMS.FACILITY_TRANSACTION_TYPE_CODES.PLUS : ENUMS.FACILITY_TRANSACTION_TYPE_CODES.MINUS;
  }

  private getUpdatedTransactionAmount(newTransactionValue: number, oldTransactionValue: number) {
    return Math.abs(newTransactionValue - oldTransactionValue);
  }
}

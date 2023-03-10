import { Injectable } from '@nestjs/common';
import { DEFAULTS } from '@ukef/constants/properties';
import { AcbsService } from '@ukef/modules/acbs/acbs.service';
import { AcbsAuthenticationService } from '@ukef/modules/acbs/acbs-authentication.service';

import { CreateDealDto } from './dto/deals-request.dto';

@Injectable()
export class DealsService {
  constructor(private readonly acbsAuthenticationService: AcbsAuthenticationService, private readonly acbsService: AcbsService) {}

  async createDeal(createDealDto: CreateDealDto): Promise<any> {
    const idToken = await this.acbsAuthenticationService.getIdToken();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Set to midnight
    const todayDateAsIso = todayDate.toISOString();

    const guaranteeCommencementDate = new Date(createDealDto.guaranteeCommencementDate);
    guaranteeCommencementDate.setHours(0, 0, 0, 0);

    const effectiveDate = guaranteeCommencementDate < todayDate ? guaranteeCommencementDate : todayDate;
    const effectiveDateAsIso = effectiveDate.toISOString();

    const requestBody = {
      dealIdentifier: createDealDto.dealIdentifier,
      dealOrigination: {
        dealOriginationCode: DEFAULTS.DEAL.dealOriginationCode,
      },
      isDealSyndicationIndicator: DEFAULTS.DEAL.isDealSyndicationIndicator,
      dealInitialStatus: {
        dealInitialStatusCode: DEFAULTS.DEAL.dealInitialStatusCode,
      },
      dealOverallStatus: {
        dealStatusCode: DEFAULTS.DEAL.dealOverallStatusCode,
      },
      dealType: {
        dealTypeCode: DEFAULTS.DEAL.dealTypeCode,
      },
      dealReviewFrequencyType: {
        dealReviewFrequencyTypeCode: DEFAULTS.DEAL.dealReviewFrequencyTypeCode,
      },
      previousDealPortfolioIdentifier: DEFAULTS.DEAL.previousDealPortfolioIdentifier,
      dealLegallyBindingIndicator: DEFAULTS.DEAL.dealLegallyBindingIndicator,
      dealUserDefinedList5: {
        dealUserDefinedList5Code: DEFAULTS.DEAL.dealUserDefinedList5Code,
      },
      dealExternalReferences: [],
      portfolioIdentifier: DEFAULTS.DEAL.portfolioIdentifier,
      description: 'D: ' + createDealDto.obligorName.substring(0, 19) + ' ' + createDealDto.currency + ' ' + effectiveDate.toLocaleDateString(),
      currency: {
        currencyCode: createDealDto.currency,
        isActiveIndicator: true,
      },
      originalEffectiveDate: effectiveDateAsIso,
      bookingDate: DEFAULTS.DEAL.bookingDate,
      finalAvailableDate: DEFAULTS.DEAL.finalAvailableDate,
      isFinalAvailableDateMaximum: DEFAULTS.DEAL.isFinalAvailableDateMaximum,
      expirationDate: DEFAULTS.DEAL.expirationDate,
      isExpirationDateMaximum: DEFAULTS.DEAL.isExpirationDateMaximum,
      limitAmount: parseFloat(createDealDto.dealValue.toFixed(2)),
      withheldAmount: DEFAULTS.DEAL.withheldAmount,
      memoLimitAmount: DEFAULTS.DEAL.memoLimitAmount,
      bookingClass: {
        bookingClassCode: DEFAULTS.DEAL.bookingClassCode,
      },
      targetClosingDate: effectiveDateAsIso,
      memoUsedAmount: DEFAULTS.DEAL.memoUsedAmount,
      memoAvailableAmount: DEFAULTS.DEAL.memoAvailableAmount,
      memoWithheldAmount: DEFAULTS.DEAL.memoWithheldAmount,
      originalApprovalDate: effectiveDateAsIso,
      currentOfficer: {
        lineOfficerIdentifier: DEFAULTS.DEAL.lineOfficerIdentifier,
      },
      secondaryOfficer: {
        lineOfficerIdentifier: DEFAULTS.DEAL.lineOfficerIdentifier,
      },
      generalLedgerUnit: {
        generalLedgerUnitIdentifier: DEFAULTS.DEAL.generalLedgerUnitIdentifier,
      },
      servicingUnit: {
        servicingUnitIdentifier: DEFAULTS.DEAL.servicingUnitIdentifier,
      },
      servicingUnitSection: {
        servicingUnitSectionIdentifier: DEFAULTS.DEAL.servicingUnitSectionIdentifier,
      },
      agentBankPartyIdentifier: DEFAULTS.DEAL.agentBankPartyIdentifier,
      industryClassification: {
        industryClassificationCode: createDealDto.obligorIndustryClassification,
      },
      riskCountry: {
        countryCode: DEFAULTS.DEAL.riskCountryCode,
      },
      purposeType: {
        purposeTypeCode: DEFAULTS.DEAL.purposeTypeCode,
      },
      capitalClass: {
        capitalClassCode: DEFAULTS.DEAL.capitalClassCode,
      },
      capitalConversionFactor: {
        capitalConversionFactorCode: DEFAULTS.DEAL.capitalConversionFactorCode,
      },
      financialFXRate: DEFAULTS.DEAL.financialFXRate,
      financialFXRateOperand: DEFAULTS.DEAL.financialFXRateOperand,
      financialRateFXRateGroup: DEFAULTS.DEAL.financialRateFXRateGroup,
      financialFrequencyCode: DEFAULTS.DEAL.financialFrequencyCode,
      financialBusinessDayAdjustment: DEFAULTS.DEAL.financialBusinessDayAdjustment,
      financialDueMonthEndIndicator: !DEFAULTS.DEAL.financialDueMonthEndIndicator,
      financialCalendar: {
        calendarIdentifier: DEFAULTS.DEAL.financialcalendarIdentifier,
      },
      financialLockMTMRateIndicator: DEFAULTS.DEAL.financialLockMTMRateIndicator,
      financialNextValuationDate: DEFAULTS.DEAL.financialNextValuationDate,
      customerFXRateGroup: DEFAULTS.DEAL.customerFXRateGroup,
      customerFrequencyCode: DEFAULTS.DEAL.customerFrequencyCode,
      customerBusinessDayAdjustment: DEFAULTS.DEAL.customerBusinessDayAdjustment,
      customerDueMonthEndIndicator: DEFAULTS.DEAL.customerDueMonthEndIndicator,
      customerCalendar: {
        calendarIdentifier: DEFAULTS.DEAL.customerCalendarIdentifier,
      },
      customerLockMTMRateIndicator: DEFAULTS.DEAL.customerLockMTMRateIndicator,
      customerNextValuationDate: DEFAULTS.DEAL.customerNextValuationDate,
      limitRevolvingIndicator: DEFAULTS.DEAL.limitRevolvingIndicator,
      servicingUser: {
        userAcbsIdentifier: DEFAULTS.DEAL.servicingUser.userAcbsIdentifier,
        userName: DEFAULTS.DEAL.servicingUser.userName,
      },
      administrativeUser: {
        userAcbsIdentifier: DEFAULTS.DEAL.administrativeUser.userAcbsIdentifier,
        userName: DEFAULTS.DEAL.administrativeUser.userName,
      },
      creditReviewRiskType: {
        creditReviewRiskTypeCode: DEFAULTS.DEAL.creditReviewRiskTypeCode,
      },

      nextReviewDate: DEFAULTS.DEAL.nextReviewDate,
      isNextReviewDateZero: DEFAULTS.DEAL.isNextReviewDateZero,
      officerRiskRatingType: {
        officerRiskRatingTypeCode: DEFAULTS.DEAL.officerRiskRatingTypeCode,
      },
      officerRiskDate: todayDateAsIso,
      isOfficerRiskDateZero: DEFAULTS.DEAL.isOfficerRiskDateZero,
      isCreditReviewRiskDateZero: DEFAULTS.DEAL.isCreditReviewRiskDateZero,
      regulatorRiskDate: DEFAULTS.DEAL.regulatorRiskDate,
      isRegulatorRiskDateZero: DEFAULTS.DEAL.isRegulatorRiskDateZero,
      multiCurrencyArrangementIndicator: DEFAULTS.DEAL.multiCurrencyArrangementIndicator,
      isUserDefinedDate1Zero: DEFAULTS.DEAL.isUserDefinedDate1Zero,
      isUserDefinedDate2Zero: DEFAULTS.DEAL.isUserDefinedDate2Zero,
      isUserDefinedDate3Zero: DEFAULTS.DEAL.isUserDefinedDate3Zero,
      isUserDefinedDate4Zero: DEFAULTS.DEAL.isUserDefinedDate4Zero,
      sharedNationalCredit: DEFAULTS.DEAL.sharedNationalCredit,
      defaultReason: {
        defaultReasonCode: DEFAULTS.DEAL.defaultReasonCode,
      },
      accountStructure: {
        accountStructureCode: DEFAULTS.DEAL.accountStructureCode,
      },
      lenderType: {
        lenderTypeCode: DEFAULTS.DEAL.lenderTypeCode,
      },
      borrowerParty: {
        partyIdentifier: createDealDto.obligorPartyIdentifier,
        alternateIdentifier: null,
        name1: createDealDto.obligorName,
        industryClassification: {
          industryClassificationCode: createDealDto.obligorIndustryClassification,
        },
        partyType: {
          partyTypeCode: '',
        },
        partyStatus: {
          partyStatusCode: '',
        },
      },
      riskMitigation: {
        riskMitigationCode: DEFAULTS.DEAL.riskMitigationCode,
      },
    };
    return this.acbsService.createDeal(createDealDto.portfolioIdentifier, requestBody, idToken);
  }
}

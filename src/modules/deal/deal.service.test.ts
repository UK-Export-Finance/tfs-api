import { PROPERTIES } from '@ukef/constants';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { AcbsAuthenticationService } from '../acbs/acbs-authentication.service';
import { AcbsDealService } from '../acbs/acbs-deal.service';
import { AcbsCreateDealDto } from '../acbs/dto/acbs-create-deal.dto';
import { CurrentDateProvider } from '../date/current-date.provider';
import { DateStringTransformations } from '../date/date-string.transformations';
import { DealService } from './deal.service';

describe('DealService', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const idToken = valueGenerator.string();

  let service: DealService;
  let acbsDealServiceCreateDeal: jest.Mock;
  let currentDateProviderGetEarliestDateFromTodayAnd: jest.Mock;

  beforeEach(() => {
    const acbsDealService = new AcbsDealService(null, null);
    acbsDealServiceCreateDeal = jest.fn();
    acbsDealService.createDeal = acbsDealServiceCreateDeal;

    const acbsAuthenticationService = new AcbsAuthenticationService(null, null, null);
    const acbsAuthenticationServiceGetIdToken = jest.fn();
    acbsAuthenticationService.getIdToken = acbsAuthenticationServiceGetIdToken;
    when(acbsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const currentDateProvider = new CurrentDateProvider();
    currentDateProviderGetEarliestDateFromTodayAnd = jest.fn();
    currentDateProvider.getEarliestDateFromTodayAnd = currentDateProviderGetEarliestDateFromTodayAnd;

    service = new DealService(acbsAuthenticationService, acbsDealService, dateStringTransformations, currentDateProvider);
  });

  describe('createDeal', () => {
    const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
    const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });
    const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
    const dealValue = 123.45;
    const guaranteeCommencementDateAsDate = new Date('2019-01-02T00:00:00Z');
    const guaranteeCommencementDateInPast = dateStringTransformations.getDateOnlyStringFromDate(guaranteeCommencementDateAsDate);
    const guaranteeCommencementDateString = dateStringTransformations.getDateStringFromDate(guaranteeCommencementDateAsDate);
    const guaranteeCommencementDateForDescription = '02/01/2019';
    const now = new Date();
    const midnightToday = dateStringTransformations.getDateStringFromDate(now);
    const todayFormattedForDescription = dateStringTransformations.getDateOnlyStringFromDate(now).split('-').reverse().join('/');
    const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
    const obligorName = valueGenerator.string({ maxLength: 19 });
    const obligorIndustryClassification = valueGenerator.string({ maxLength: 10 });

    const dealToCreate = {
      dealIdentifier,
      currency,
      dealValue,
      guaranteeCommencementDate: guaranteeCommencementDateInPast,
      obligorPartyIdentifier: obligorPartyIdentifier,
      obligorName: obligorName,
      obligorIndustryClassification: obligorIndustryClassification,
    };

    const getExpectedDescription = ({ obligorName, currency, formattedDate }: { obligorName: string; currency: string; formattedDate: string }): string =>
      `D: ${obligorName} ${currency} ${formattedDate}`;

    const defaultValues = PROPERTIES.DEAL.DEFAULTS;
    const expectedDealToCreateInAcbs = {
      DealIdentifier: dealIdentifier,
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
      Description: getExpectedDescription({ obligorName, currency, formattedDate: guaranteeCommencementDateForDescription }),
      Currency: {
        CurrencyCode: currency,
        IsActiveIndicator: true,
      },
      OriginalEffectiveDate: guaranteeCommencementDateString,
      BookingDate: defaultValues.bookingDate,
      FinalAvailableDate: defaultValues.finalAvailableDate,
      IsFinalAvailableDateMaximum: defaultValues.isFinalAvailableDateMaximum,
      ExpirationDate: defaultValues.expirationDate,
      IsExpirationDateMaximum: defaultValues.isExpirationDateMaximum,
      LimitAmount: dealValue,
      WithheldAmount: defaultValues.withheldAmount,
      MemoLimitAmount: defaultValues.memoLimitAmount,
      BookingClass: {
        BookingClassCode: defaultValues.bookingClassCode,
      },
      TargetClosingDate: guaranteeCommencementDateString,
      MemoUsedAmount: defaultValues.memoUsedAmount,
      MemoAvailableAmount: defaultValues.memoAvailableAmount,
      MemoWithheldAmount: defaultValues.memoWithheldAmount,
      OriginalApprovalDate: guaranteeCommencementDateString,
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
        IndustryClassificationCode: obligorIndustryClassification,
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
      OfficerRiskDate: midnightToday,
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
        PartyIdentifier: obligorPartyIdentifier,
      },
      RiskMitigation: {
        RiskMitigationCode: defaultValues.riskMitigationCode,
      },
    };

    beforeEach(() => {
      when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(guaranteeCommencementDateAsDate);
    });

    it('creates a deal in ACBS with a transformation of the requested new deal', async () => {
      await service.createDeal(dealToCreate);

      expect(acbsDealServiceCreateDeal).toHaveBeenCalledWith(portfolioIdentifier, expectedDealToCreateInAcbs, idToken);
    });

    it('truncates the obligorName to 19 characters in the Description', async () => {
      const tooLongObligorName = '123456789_123456789_123456789';
      const obligorNameTruncatedTo19Characters = '123456789_123456789';
      const dealWithTooLongObligorName = { ...dealToCreate, obligorName: tooLongObligorName };
      const descriptionWithTruncatedObligorName = getExpectedDescription({
        obligorName: obligorNameTruncatedTo19Characters,
        currency,
        formattedDate: guaranteeCommencementDateForDescription,
      });

      await service.createDeal(dealWithTooLongObligorName);

      const dealCreatedInAcbs: AcbsCreateDealDto = acbsDealServiceCreateDeal.mock.calls[0][1];

      expect(dealCreatedInAcbs.Description).toBe(descriptionWithTruncatedObligorName);
    });

    it('rounds the dealValue to 2dp for the LimitAmount', async () => {
      const dealValueWithMoreThan2dp = 1.234;
      const dealValueRoundedTo2dp = 1.23;
      const dealWithDealValueWithMoreThan2dp = { ...dealToCreate, dealValue: dealValueWithMoreThan2dp };

      await service.createDeal(dealWithDealValueWithMoreThan2dp);

      const dealCreatedInAcbs: AcbsCreateDealDto = acbsDealServiceCreateDeal.mock.calls[0][1];

      expect(dealCreatedInAcbs.LimitAmount).toBe(dealValueRoundedTo2dp);
    });

    describe('replaces the guaranteeCommencementDate with today if the guaranteeCommencementDate is after today', () => {
      let dealCreatedInAcbs: AcbsCreateDealDto;

      beforeEach(async () => {
        currentDateProviderGetEarliestDateFromTodayAnd.mockReset();
        when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(now);

        await service.createDeal(dealToCreate);

        dealCreatedInAcbs = acbsDealServiceCreateDeal.mock.calls[0][1];
      });

      it('in the OriginalEffectiveDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalEffectiveDate).toBe(midnightToday);
      });

      it('in the OriginalApprovalDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalApprovalDate).toBe(midnightToday);
      });

      it('in the TargetClosingDate field in ACBS', () => {
        expect(dealCreatedInAcbs.TargetClosingDate).toBe(midnightToday);
      });

      it('in the Description field in ACBS', () => {
        const expectedDescriptionWithToday = getExpectedDescription({ obligorName, currency, formattedDate: todayFormattedForDescription });

        expect(dealCreatedInAcbs.Description).toBe(expectedDescriptionWithToday);
      });
    });

    describe('does NOT replace the guaranteeCommencementDate with today if the guaranteeCommencementDate is before or equal to today', () => {
      let dealCreatedInAcbs: AcbsCreateDealDto;

      beforeEach(async () => {
        currentDateProviderGetEarliestDateFromTodayAnd.mockReset();
        when(currentDateProviderGetEarliestDateFromTodayAnd).calledWith(guaranteeCommencementDateAsDate).mockReturnValueOnce(guaranteeCommencementDateAsDate);

        await service.createDeal(dealToCreate);

        dealCreatedInAcbs = acbsDealServiceCreateDeal.mock.calls[0][1];
      });

      it('in the OriginalEffectiveDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalEffectiveDate).toBe(guaranteeCommencementDateString);
      });

      it('in the OriginalApprovalDate field in ACBS', () => {
        expect(dealCreatedInAcbs.OriginalApprovalDate).toBe(guaranteeCommencementDateString);
      });

      it('in the TargetClosingDate field in ACBS', () => {
        expect(dealCreatedInAcbs.TargetClosingDate).toBe(guaranteeCommencementDateString);
      });

      it('in the Description field in ACBS', () => {
        const expectedDescriptionWithGuaranteeCommencementDate = getExpectedDescription({
          obligorName,
          currency,
          formattedDate: guaranteeCommencementDateForDescription,
        });

        expect(dealCreatedInAcbs.Description).toBe(expectedDescriptionWithGuaranteeCommencementDate);
      });
    });
  });
});

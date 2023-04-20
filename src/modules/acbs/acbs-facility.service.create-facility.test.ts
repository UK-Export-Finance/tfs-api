import { HttpService } from '@nestjs/axios';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { when } from 'jest-when';
import { of, throwError } from 'rxjs';

import { AcbsFacilityService } from './acbs-facility.service';
import { AcbsCreateFacilityRequest } from './dto/acbs-create-facility-request.dto';
import { AcbsBadRequestException } from './exception/acbs-bad-request.exception';
import { AcbsUnexpectedException } from './exception/acbs-unexpected.exception';

describe('AcbsFacilityService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const baseUrl = valueGenerator.httpsUrl();
  const randomPortfolioIdentifier = valueGenerator.string({ length: 2 });
  const facilityIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });

  let httpService: HttpService;
  let service: AcbsFacilityService;

  let httpServicePost: jest.Mock;

  const newFacility: AcbsCreateFacilityRequest = {
    FacilityIdentifier: facilityIdentifier,
    Description: valueGenerator.string(),
    Currency: {
      CurrencyCode: TEST_CURRENCIES.A_TEST_CURRENCY,
      IsActiveIndicator: valueGenerator.boolean(),
    },
    OriginalEffectiveDate: valueGenerator.dateTimeString(),
    DealIdentifier: valueGenerator.stringOfNumericCharacters({ length: 10 }),
    DealPortfolioIdentifier: valueGenerator.string(),
    DealBorrowerPartyIdentifier: valueGenerator.stringOfNumericCharacters({ length: 8 }),
    BookingDate: valueGenerator.dateTimeString(),
    FinalAvailableDate: valueGenerator.dateTimeString(),
    IsFinalAvailableDateMaximum: valueGenerator.boolean(),
    ExpirationDate: valueGenerator.dateTimeString(),
    IsExpirationDateMaximum: valueGenerator.boolean(),
    LimitAmount: valueGenerator.nonnegativeFloat(),
    ExternalReferenceIdentifier: valueGenerator.string(),
    BookingClass: {
      BookingClassCode: valueGenerator.string(),
    },
    FacilityType: {
      FacilityTypeCode: valueGenerator.string(),
    },
    TargetClosingDate: valueGenerator.dateTimeString(),
    FacilityInitialStatus: {
      FacilityInitialStatusCode: valueGenerator.string(),
    },
    OriginalApprovalDate: valueGenerator.dateTimeString(),
    CurrentOfficer: {
      LineOfficerIdentifier: valueGenerator.string(),
    },
    SecondaryOfficer: {
      LineOfficerIdentifier: valueGenerator.string(),
    },
    GeneralLedgerUnit: {
      GeneralLedgerUnitIdentifier: valueGenerator.string(),
    },
    ServicingUnit: {
      ServicingUnitIdentifier: valueGenerator.string(),
    },
    ServicingUnitSection: {
      ServicingUnitSectionIdentifier: valueGenerator.string(),
    },
    AgentBankPartyIdentifier: valueGenerator.string(),
    IndustryClassification: {
      IndustryClassificationCode: valueGenerator.string(),
    },
    RiskCountry: {
      CountryCode: valueGenerator.string(),
    },
    PurposeType: {
      PurposeTypeCode: valueGenerator.string(),
    },
    FacilityReviewFrequencyType: {
      FacilityReviewFrequencyTypeCode: valueGenerator.string(),
    },
    CapitalClass: {
      CapitalClassCode: valueGenerator.string(),
    },
    CapitalConversionFactor: {
      CapitalConversionFactorCode: valueGenerator.string(),
    },
    FinancialFXRate: valueGenerator.nonnegativeFloat(),
    FinancialFXRateOperand: valueGenerator.string(),
    FinancialRateFXRateGroup: valueGenerator.string(),
    FinancialFrequencyCode: valueGenerator.string(),
    FinancialBusinessDayAdjustment: valueGenerator.string(),
    FinancialDueMonthEndIndicator: valueGenerator.boolean(),
    FinancialCalendar: {
      CalendarIdentifier: valueGenerator.string(),
    },
    FinancialLockMTMRateIndicator: valueGenerator.boolean(),
    FinancialNextValuationDate: valueGenerator.dateTimeString(),
    CustomerFXRateGroup: valueGenerator.string(),
    CustomerFrequencyCode: valueGenerator.string(),
    CustomerBusinessDayAdjustment: valueGenerator.string(),
    CustomerDueMonthEndIndicator: valueGenerator.boolean(),
    CustomerCalendar: {
      CalendarIdentifier: valueGenerator.string(),
    },
    CustomerLockMTMRateIndicator: valueGenerator.boolean(),
    CustomerNextValuationDate: valueGenerator.dateTimeString(),
    LimitRevolvingIndicator: valueGenerator.boolean(),
    StandardReferenceType: '',
    AdministrativeUser: {
      UserAcbsIdentifier: valueGenerator.string(),
      UserName: valueGenerator.string(),
    },
    CreditReviewRiskType: {
      CreditReviewRiskTypeCode: valueGenerator.string(),
    },
    NextReviewDate: valueGenerator.dateTimeString(),
    IsNextReviewDateZero: valueGenerator.boolean(),
    OfficerRiskRatingType: {
      OfficerRiskRatingTypeCode: valueGenerator.string(),
    },
    OfficerRiskDate: valueGenerator.dateTimeString(),
    IsOfficerRiskDateZero: valueGenerator.boolean(),
    CreditReviewRiskDate: valueGenerator.dateTimeString(),
    IsCreditReviewRiskDateZero: valueGenerator.boolean(),
    RegulatorRiskDate: valueGenerator.dateTimeString(),
    IsRegulatorRiskDateZero: valueGenerator.boolean(),
    MultiCurrencyArrangementIndicator: valueGenerator.boolean(),
    FacilityUserDefinedList1: {
      FacilityUserDefinedList1Code: valueGenerator.string(),
    },
    FacilityUserDefinedList3: {
      FacilityUserDefinedList3Code: valueGenerator.string(),
    },
    FacilityUserDefinedList6: {
      FacilityUserDefinedList6Code: valueGenerator.string(),
    },
    UserDefinedDate1: valueGenerator.dateTimeString(),
    IsUserDefinedDate1Zero: valueGenerator.boolean(),
    UserDefinedDate2: valueGenerator.dateTimeString(),
    IsUserDefinedDate2Zero: valueGenerator.boolean(),
    IsUserDefinedDate3Zero: valueGenerator.boolean(),
    IsUserDefinedDate4Zero: valueGenerator.boolean(),
    UserDefinedAmount3: valueGenerator.nonnegativeFloat(),
    ProbabilityofDefault: valueGenerator.nonnegativeFloat(),
    DefaultReason: {
      DefaultReasonCode: valueGenerator.string(),
    },
    DoubtfulPercent: valueGenerator.nonnegativeFloat(),
    DrawUnderTemplateIndicator: valueGenerator.boolean(),
    FacilityOrigination: {
      FacilityOriginationCode: valueGenerator.string(),
    },
    AccountStructure: {
      AccountStructureCode: valueGenerator.string(),
    },
    FacilityOverallStatus: {
      FacilityStatusCode: valueGenerator.string(),
    },
    LenderType: {
      LenderTypeCode: valueGenerator.string(),
    },
    BorrowerParty: {
      PartyIdentifier: valueGenerator.stringOfNumericCharacters({ length: 8 }),
    },
    ServicingUser: {
      UserAcbsIdentifier: valueGenerator.string(),
      UserName: valueGenerator.string(),
    },
    CompBalPctReserve: valueGenerator.nonnegativeFloat(),
    CompBalPctAmount: valueGenerator.nonnegativeFloat(),
    RiskMitigation: {
      RiskMitigationCode: valueGenerator.string(),
    },
  };

  const expectedHttpServicePostArgs = [
    `/Portfolio/${randomPortfolioIdentifier}/Facility`,
    newFacility,
    {
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    },
  ];

  beforeEach(() => {
    httpService = new HttpService();

    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new AcbsFacilityService({ baseUrl }, httpService);
  });

  describe('createFacility', () => {
    it('sends a POST to ACBS to create a facility with the specified parameters', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: '',
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);
    });

    it('throws an AcbsBadRequestException if ACBS responds with a 400 error', async () => {
      const axiosError = new AxiosError();
      const errorString = valueGenerator.string();
      axiosError.response = {
        data: errorString,
        status: 400,
        statusText: 'Bad Request',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createFacilityPromise = service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

      await expect(createFacilityPromise).rejects.toBeInstanceOf(AcbsBadRequestException);
      await expect(createFacilityPromise).rejects.toThrow(`Failed to create a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(createFacilityPromise).rejects.toHaveProperty('innerError', axiosError);
      await expect(createFacilityPromise).rejects.toHaveProperty('errorBody', errorString);
    });

    it('throws an AcbsUnexpectedException if ACBS responds with an error code that is not 400', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 401,
        statusText: 'Unauthorized',
        headers: undefined,
        config: undefined,
      };

      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const createDealPromise = service.createFacility(randomPortfolioIdentifier, newFacility, idToken);

      await expect(createDealPromise).rejects.toBeInstanceOf(AcbsUnexpectedException);
      await expect(createDealPromise).rejects.toThrow(`Failed to create a facility with identifier ${facilityIdentifier} in ACBS.`);
      await expect(createDealPromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});

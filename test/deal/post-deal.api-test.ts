import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withRequiredDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/required-date-only-field-validation-api-tests';
import { withRequiredNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/required-non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /deals', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const createDealUrl = `/api/v1/deals`;

  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });
  const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
  const dealValue = 123.45;
  const guaranteeCommencementDateInPast = '2019-01-02';
  const guaranteeCommencementDateForDescription = '02/01/2019';
  const guaranteeCommencementDateInAcbs = '2019-01-02T00:00:00Z';
  const now = new Date();
  const midnightToday = dateStringTransformations.getDateStringFromDate(now);
  const todayFormattedForDescription = dateStringTransformations.getDateOnlyStringFromDate(now).split('-').reverse().join('/');
  const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const obligorName = valueGenerator.string({ maxLength: 19 });
  const obligorIndustryClassification = valueGenerator.string({ maxLength: 10 });

  const getExpectedDescription = ({ obligorName, currency, formattedDate }: { obligorName: string; currency: string; formattedDate: string }): string =>
    `D: ${obligorName} ${currency} ${formattedDate}`;

  const requestBodyToCreateDeal = [
    {
      dealIdentifier,
      currency,
      dealValue,
      guaranteeCommencementDate: guaranteeCommencementDateInPast,
      obligorPartyIdentifier: obligorPartyIdentifier,
      obligorName: obligorName,
      obligorIndustryClassification: obligorIndustryClassification,
    },
  ];

  const defaultValues = PROPERTIES.DEAL.DEFAULTS;
  const acbsRequestBodyToCreateDeal = {
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
    OriginalEffectiveDate: guaranteeCommencementDateInAcbs,
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
    TargetClosingDate: guaranteeCommencementDateInAcbs,
    MemoUsedAmount: defaultValues.memoUsedAmount,
    MemoAvailableAmount: defaultValues.memoAvailableAmount,
    MemoWithheldAmount: defaultValues.memoWithheldAmount,
    OriginalApprovalDate: guaranteeCommencementDateInAcbs,
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

  const expectedDealIdentifierResponse = { dealIdentifier };

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  const { idToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateDealInAcbsSucceeds(),
    makeRequest: () => api.post(createDealUrl, requestBodyToCreateDeal),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createDealUrl, requestBodyToCreateDeal, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the identifier of the new deal if ACBS responds with 201', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateDealInAcbs().reply(201, undefined, { location: `/Deal/${dealIdentifier}` });

    const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedDealIdentifierResponse)));
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('rounds the dealValue to 2dp', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const requestBodyWithDealValueToRound = [{ ...requestBodyToCreateDeal[0], dealValue: 1.234 }];
    const acbsRequestBodyWithRoundedDealValue = {
      ...acbsRequestBodyToCreateDeal,
      LimitAmount: 1.23,
    };
    const acbsRequest = requestToCreateDealInAcbsWithBody(acbsRequestBodyWithRoundedDealValue).reply(201, undefined, { location: `/Deal/${dealIdentifier}` });

    const { status, body } = await api.post(createDealUrl, requestBodyWithDealValueToRound);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedDealIdentifierResponse)));
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('truncates the obligorName in the description after 19 characters', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const requestBodyWithObligorNameToTruncate = [{ ...requestBodyToCreateDeal[0], obligorName: '123456789-123456789-123456789' }];
    const acbsRequestBodyWithTruncatedObligorName = {
      ...acbsRequestBodyToCreateDeal,
      Description: getExpectedDescription({ obligorName: '123456789-123456789', currency, formattedDate: guaranteeCommencementDateForDescription }),
    };
    const acbsRequest = requestToCreateDealInAcbsWithBody(acbsRequestBodyWithTruncatedObligorName).reply(201, undefined, {
      location: `/Deal/${dealIdentifier}`,
    });

    const { status, body } = await api.post(createDealUrl, requestBodyWithObligorNameToTruncate);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedDealIdentifierResponse)));
    expect(acbsRequest.isDone()).toBe(true);
  });

  it(`replaces the guaranteeCommencementdate with today's date if the specified effectiveDate is after today`, async () => {
    const requestBodyWithFutureEffectiveDate = [{ ...requestBodyToCreateDeal[0], guaranteeCommencementDate: '9999-01-01' }];
    const acbsRequestBodyWithTodayEffectiveDate = {
      ...acbsRequestBodyToCreateDeal,
      OriginalEffectiveDate: midnightToday,
      TargetClosingDate: midnightToday,
      OriginalApprovalDate: midnightToday,
      Description: getExpectedDescription({ obligorName, currency, formattedDate: todayFormattedForDescription }),
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithTodayEffectiveDate = requestToCreateDealInAcbsWithBody(acbsRequestBodyWithTodayEffectiveDate).reply(201, undefined, {
      location: `/Deal/${dealIdentifier}`,
    });

    const { status, body } = await api.post(createDealUrl, requestBodyWithFutureEffectiveDate);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithTodayEffectiveDate.isDone()).toBe(true);
  });

  withStringFieldValidationApiTests({
    fieldName: 'dealIdentifier',
    length: 10,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'currency',
    length: 3,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.word({ length }),
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withRequiredNonNegativeNumberFieldValidationApiTests({
    fieldName: 'dealValue',
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withRequiredDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeCommencementDate',
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'obligorPartyIdentifier',
    length: 8,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'obligorName',
    minLength: 0,
    maxLength: 35,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'obligorIndustryClassification',
    minLength: 0,
    maxLength: 10,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateDealInAcbs().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToCreateDealInAcbs().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealInAcbs().reply(401, 'Unauthorized');

    const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  const givenRequestToCreateDealInAcbsSucceeds = (): void => {
    requestToCreateDealInAcbs().reply(201, undefined, { location: `/Deal/${dealIdentifier}` });
  };

  const requestToCreateDealInAcbs = (): nock.Interceptor => requestToCreateDealInAcbsWithBody(acbsRequestBodyToCreateDeal);

  const requestToCreateDealInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).post(`/Portfolio/${portfolioIdentifier}/Deal`, requestBody).matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestBodyToCreateDealInAcbsSucceeds = (): nock.Scope => {
    const requestBodyPlaceholder = '*';
    return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Deal`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, { location: `/Deal/${dealIdentifier}` });
  };
});

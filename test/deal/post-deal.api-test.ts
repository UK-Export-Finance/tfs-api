import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateDealGenerator } from '@ukef-test/support/generator/create-deal-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /deals', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const createDealUrl = `/api/v1/deals`;

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const {
    createDealRequestItem: dealToCreate,
    acbsCreateDealRequest: acbsRequestBodyToCreateDeal,
    acbsUpdateDealBorrowingRestrictionRequest: acbsRequestBodyToUpdateBorrowingRestriction,
    guaranteeCommencementDateForDescription,
  } = new CreateDealGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
  const { dealIdentifier } = dealToCreate;

  const now = new Date('2023-06-13');
  const midnightToday = dateStringTransformations.getDateStringFromDate(now);
  const todayFormattedForDescription = dateStringTransformations.getDateOnlyStringFromDate(now).substring(2).split('-').reverse().join('/');

  const requestBodyToCreateDeal = [dealToCreate];

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
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToCreateDealInAcbsSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    },
    makeRequest: () => api.post(createDealUrl, requestBodyToCreateDeal),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createDealUrl, requestBodyToCreateDeal, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the identifier of the new deal if creating the deal and updating the borrowing restriction for the deal both succeed in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestToCreateDeal = givenRequestToCreateDealInAcbsSucceeds();
    const acbsRequestToUpdateDealBorrowingRestriction = givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();

    const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedDealIdentifierResponse)));
    expect(acbsRequestToCreateDeal.isDone()).toBe(true);
    expect(acbsRequestToUpdateDealBorrowingRestriction.isDone()).toBe(true);
  });

  describe('transformations of the data for the deal to be created', () => {
    beforeEach(() => {
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
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
        Description: CreateDealGenerator.getExpectedDescription({
          obligorName: '123456789-123456789',
          currency: dealToCreate.currency,
          formattedDate: guaranteeCommencementDateForDescription,
        }),
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
        Description: CreateDealGenerator.getExpectedDescription({
          obligorName: dealToCreate.obligorName,
          currency: dealToCreate.currency,
          formattedDate: todayFormattedForDescription,
        }),
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
  });

  describe('error cases when creating the deal in ACBS', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToCreateDealInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateDealInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
      requestToCreateDealInAcbs().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out"', async () => {
      requestToCreateDealInAcbs()
        .delay(TIME_EXCEEDING_ACBS_TIMEOUT)
        .reply(201, undefined, { location: `/Deal/${dealIdentifier}` });

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });
  });

  describe('error cases when updating the deal borrowing restriction in ACBS', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateDealInAcbsSucceeds();
    });

    it('returns a 500 response if ACBS responds with a 400 response that is a string containing "The deal not found"', async () => {
      const acbsErrorMessage = 'The deal not found or the user does not have access to it.';
      requestToUpdateDealBorrowingRestrictionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
        error: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is a string that does not contain "The deal not found"', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToUpdateDealBorrowingRestrictionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
        error: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is not a string', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToUpdateDealBorrowingRestrictionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
        error: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
      requestToUpdateDealBorrowingRestrictionInAcbs().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
        error: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    });

    it('returns a 500 response if ACBS times out"', async () => {
      requestToUpdateDealBorrowingRestrictionInAcbs().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200);

      const { status, body } = await api.post(createDealUrl, requestBodyToCreateDeal);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        message: 'Internal server error',
        statusCode: 500,
        error: `Failed to update the deal borrowing restriction after creating deal ${dealIdentifier}`,
      });
    });
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
      givenRequestToUpdateAnyDealBorrowingRestrictionInAcbsSucceeds();
    },
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    },
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'dealValue',
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeCommencementDate',
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
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
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
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
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
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
      givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds();
    },
  });

  const givenRequestToCreateDealInAcbsSucceeds = (): nock.Scope => requestToCreateDealInAcbs().reply(201, undefined, { location: `/Deal/${dealIdentifier}` });

  const requestToCreateDealInAcbs = (): nock.Interceptor => requestToCreateDealInAcbsWithBody(JSON.stringify(acbsRequestBodyToCreateDeal));

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

  const givenRequestToUpdateDealBorrowingRestrictionForDealInAcbsSucceeds = (): nock.Scope => requestToUpdateDealBorrowingRestrictionInAcbs().reply(200);

  const requestToUpdateDealBorrowingRestrictionInAcbs = (): nock.Interceptor =>
    requestToUpdateDealBorrowingRestrictionInAcbsWithBody(JSON.stringify(acbsRequestBodyToUpdateBorrowingRestriction));

  const requestToUpdateDealBorrowingRestrictionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/BorrowingRestriction`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToUpdateAnyDealBorrowingRestrictionInAcbsSucceeds = (): nock.Scope =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(new RegExp(`/Portfolio/${portfolioIdentifier}/Deal/\\d{10}/BorrowingRestriction`), JSON.stringify(acbsRequestBodyToUpdateBorrowingRestriction))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200);
});

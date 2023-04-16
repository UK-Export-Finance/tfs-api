import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
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
    guaranteeCommencementDateForDescription,
  } = new CreateDealGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
  const dealIdentifier = dealToCreate.dealIdentifier;

  const now = new Date();
  const midnightToday = dateStringTransformations.getDateStringFromDate(now);
  const todayFormattedForDescription = dateStringTransformations.getDateOnlyStringFromDate(now).split('-').reverse().join('/');

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateDealInAcbsSucceeds(),
    makeRequest: () => api.post(createDealUrl, requestBodyToCreateDeal),
    successStatusCode: 201,
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

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'dealValue',
    validRequestBody: requestBodyToCreateDeal,
    makeRequest: (body) => api.post(createDealUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
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
});

import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { AcbsCreateDealInvestorRequest } from '@ukef/modules/acbs/dto/acbs-create-deal-investor-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateDealInvestorGenerator } from '@ukef-test/support/generator/create-deal-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

import { CurrentDateProvider } from '../../src/modules/date/current-date.provider';

describe('POST /deals/{dealIdentifier}/investors', () => {
  const valueGenerator = new RandomValueGenerator();
  const currentDateProvider = new CurrentDateProvider();
  const dateStringTransformations = new DateStringTransformations();

  const dealIdentifier: UkefId = valueGenerator.ukefId();
  const createDealInvestorUrl = `/api/v1/deals/${dealIdentifier}/investors`;

  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  const { acbsRequestBodyToCreateDealInvestor, requestBodyToCreateDealInvestor } = new CreateDealInvestorGenerator(
    valueGenerator,
    currentDateProvider,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 2,
    dealIdentifier: dealIdentifier,
  });

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateDealInvestorInAcbsSucceeds(),
    makeRequest: () => api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateDealInvestorInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createDealInvestorUrl, requestBodyToCreateDealInvestor, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the deal identifier if the deal investor has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateDealInvestorInAcbsSucceeds();

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('sets the default lenderType if it is not specified in the request', async () => {
    const { lenderType: _removed, ...newDealInvestorWithoutLenderType } = requestBodyToCreateDealInvestor[0];
    const requestBodyWithoutLenderType = [newDealInvestorWithoutLenderType];
    const acbsRequestBodyWithDefaultLenderType = {
      ...acbsRequestBodyToCreateDealInvestor,
      LenderType: { LenderTypeCode: PROPERTIES.DEAL_INVESTOR.DEFAULT.lenderType.lenderTypeCode },
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithDefaultLenderType = requestToCreateDealInvestorInAcbsWithBody(acbsRequestBodyWithDefaultLenderType).reply(201);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyWithoutLenderType);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithDefaultLenderType.isDone()).toBe(true);
  });

  it('sets the default expiryDate if it is not specified in the request', async () => {
    const { expiryDate: _removed, ...newDealInvestorWithoutExpiryDate } = requestBodyToCreateDealInvestor[0];
    const requestBodyWithoutExpiryDate = [newDealInvestorWithoutExpiryDate];
    const acbsRequestBodyWithDefaultExpirationDate = {
      ...acbsRequestBodyToCreateDealInvestor,
      ExpirationDate: PROPERTIES.DEAL_INVESTOR.DEFAULT.expirationDate,
      IsExpirationDateMaximum: true,
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithDefaultExpirationDate = requestToCreateDealInvestorInAcbsWithBody(acbsRequestBodyWithDefaultExpirationDate).reply(201);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyWithoutExpiryDate);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithDefaultExpirationDate.isDone()).toBe(true);
  });

  it('sets the default dealStatus if it is not specified in the request', async () => {
    const { dealStatus: _removed, ...newDealInvestorWithoutDealStatus } = requestBodyToCreateDealInvestor[0];
    const requestBodyWithoutDealStatus = [newDealInvestorWithoutDealStatus];
    const acbsRequestBodyWithDefaultDealStatus = {
      ...acbsRequestBodyToCreateDealInvestor,
      DealStatus: {
        DealStatusCode: PROPERTIES.DEAL_INVESTOR.DEFAULT.dealStatus.dealStatusCode,
      },
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithDefaultDealStatus = requestToCreateDealInvestorInAcbsWithBody(acbsRequestBodyWithDefaultDealStatus).reply(201);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyWithoutDealStatus);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithDefaultDealStatus.isDone()).toBe(true);
  });

  it(`replaces the effectiveDate with today's date if the specified effectiveDate is after today`, async () => {
    const requestBodyWithFutureEffectiveDate = [{ ...requestBodyToCreateDealInvestor[0], effectiveDate: '9999-01-01' }];
    const acbsRequestBodyWithTodayEffectiveDate = {
      ...acbsRequestBodyToCreateDealInvestor,
      EffectiveDate: dateStringTransformations.getDateStringFromDate(new Date()),
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithTodayEffectiveDate = requestToCreateDealInvestorInAcbsWithBody(acbsRequestBodyWithTodayEffectiveDate).reply(201);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyWithFutureEffectiveDate);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithTodayEffectiveDate.isDone()).toBe(true);
  });

  withStringFieldValidationApiTests({
    fieldName: 'dealIdentifier',
    length: 10,
    pattern: '/^00\\d{8}$/',
    generateFieldValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
    generateFieldValueThatDoesNotMatchRegex: () => '1000000000' as UkefId,
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'lenderType',
    minLength: 0,
    maxLength: 3,
    required: false,
    generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'expiryDate',
    required: false,
    nullable: true,
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'dealStatus',
    minLength: 0,
    maxLength: 1,
    required: false,
    generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateDealInvestor,
    makeRequest: (body) => api.post(createDealInvestorUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds();
    },
  });

  it('returns a 404 response if ACBS responds with a 400 response that is a string containing "The deal not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealInvestor().reply(400, 'The deal not found or user does not have access');

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateDealInvestor().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "The deal not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToCreateDealInvestor().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealInvestor().reply(401, 'Unauthorized');

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  it('returns a 500 response if creating the deal investor in ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealInvestor()
      .delay(ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + 500)
      .reply(201);

    const { status, body } = await api.post(createDealInvestorUrl, requestBodyToCreateDealInvestor);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const givenRequestToCreateDealInvestorInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateDealInvestor().reply(201);
  };

  const requestToCreateDealInvestor = (): nock.Interceptor => requestToCreateDealInvestorInAcbsWithBody(acbsRequestBodyToCreateDealInvestor);

  const requestToCreateDealInvestorInAcbsWithBody = (requestBody: AcbsCreateDealInvestorRequest): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreateDealInvestorInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json')
      .reply(201);
  };
});

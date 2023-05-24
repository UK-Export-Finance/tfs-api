import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { withLoanIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/loan-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/loans/{loanIdentifier}/amendments/amount', () => {
  const valueGenerator = new RandomValueGenerator();
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  const createdBundleIdentifier = valueGenerator.acbsBundleId();
  const acbsSuccessfulResponse: [number, undefined, { BundleIdentifier: string }] = [201, undefined, { BundleIdentifier: createdBundleIdentifier }];
  const { increaseAmountRequest, decreaseAmountRequest, acbsLoanAmendmentForIncrease, acbsLoanAmendmentForDecrease } =
    new CreateFacilityLoanAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({ loanIdentifier, numberToGenerate: 1 });

  const createLoanAmountAmendmentUrl = (
    { facilityId, loanId }: { facilityId: string; loanId: string } = { facilityId: facilityIdentifier, loanId: loanIdentifier },
  ) => `/api/v1/facilities/${facilityId}/loans/${loanId}/amendments/amount`;

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
    givenRequestWouldOtherwiseSucceed: () => requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse),
    makeRequest: () => api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createLoanAmountAmendmentUrl(), increaseAmountRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns the bundleIdentifier of the created bundle in ACBS if creating an increase loan amount amendment is successful', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);

    const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      bundleIdentifier: createdBundleIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('returns the bundleIdentifier of the created bundle in ACBS if creating a decrease loan amount amendment is successful', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateDecreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);

    const { status, body } = await api.post(createLoanAmountAmendmentUrl(), decreaseAmountRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      bundleIdentifier: createdBundleIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when creating the loan advance transaction', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Loan does not exist" when creating the facility loan amount amendment', async () => {
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(400, `Loan does not exist or user does not have access to it: '${facilityIdentifier}'`);

      const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility loan amount amendment', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Loan does not exist" when creating the facility loan amount amendment', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility loan amount amendment', async () => {
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility loan amount amendment', async () => {
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs()
        .delay(TIME_EXCEEDING_ACBS_TIMEOUT)
        .reply(...acbsSuccessfulResponse);

      const { status, body } = await api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    withDateOnlyFieldValidationApiTests({
      fieldName: 'effectiveDate',
      validRequestBody: increaseAmountRequest,
      makeRequest: (body) => api.post(createLoanAmountAmendmentUrl(), body),
      givenAnyRequestBodyWouldSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
    });

    withNumberFieldValidationApiTests({
      fieldName: 'amountAmendment',
      validRequestBody: increaseAmountRequest,
      makeRequest: (body) => api.post(createLoanAmountAmendmentUrl(), body),
      givenAnyRequestBodyWouldSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      forbidZero: true,
    });
  });

  describe('URL parameter validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      makeRequestWithFacilityId: (facilityId: string) => api.post(createLoanAmountAmendmentUrl({ facilityId, loanId: loanIdentifier }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      successStatusCode: 201,
    });

    withLoanIdentifierUrlValidationApiTests({
      makeRequestWithLoanId: (loanId: string) => api.post(createLoanAmountAmendmentUrl({ loanId, facilityId: facilityIdentifier }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForLoanId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      successStatusCode: 201,
    });
  });

  const requestToCreateIncreaseLoanAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateLoanAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsLoanAmendmentForIncrease)));

  const requestToCreateDecreaseLoanAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateLoanAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsLoanAmendmentForDecrease)));

  const givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json')
      .reply(...acbsSuccessfulResponse);
  };

  const requestToCreateLoanAdvanceTransactionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');
});

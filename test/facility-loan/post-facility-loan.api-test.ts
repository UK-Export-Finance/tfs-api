import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/loans', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const postFacilityLoanUrl = `/api/v1/facilities/${facilityIdentifier}/loans`;
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;

  const { acbsRequestBodyToCreateFacilityLoan, requestBodyToCreateFacilityLoan, createFacilityLoanResponseFromService } = new CreateFacilityLoanGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    bundleIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateFacilityLoanInAcbsSucceeds(),
    makeRequest: () => api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityLoanInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(postFacilityLoanUrl, requestBodyToCreateFacilityLoan, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the bundle identifier if the facility loan has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateFacilityLoanInAcbsSucceeds();

    const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

    expect(status).toBe(201);
    expect(body).toStrictEqual(createFacilityLoanResponseFromService);
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when creating the facility loan', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the facility loan', async () => {
      requestToCreateFacilityLoan().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility loan', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateFacilityLoan().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility does not exist" when creating the facility loan', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateFacilityLoan().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility loan', async () => {
      requestToCreateFacilityLoan().reply(401, 'Unauthorized');

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility loan', async () => {
      requestToCreateFacilityLoan().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoan);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(postFacilityLoanUrl, body);

    const possibleProductTypeIds = Object.values(ENUMS.PRODUCT_TYPE_IDS);
    const possibleProductTypeGroups = Object.values(ENUMS.PRODUCT_TYPE_GROUPS);
    const possibleOperationTypes = Object.values(ENUMS.OPERATION_TYPE_CODES);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityLoanInAcbsSucceeds();
    };

    withDateOnlyFieldValidationApiTests({
      fieldName: 'postingDate',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withFacilityIdentifierFieldValidationApiTests({
      valueGenerator,
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'borrowerPartyIdentifier',
      length: 8,
      required: true,
      generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'productTypeId',
      enum: ENUMS.PRODUCT_TYPE_IDS,
      length: 3,
      generateFieldValueOfLength: (length: number) =>
        length === 3 ? possibleProductTypeIds[valueGenerator.integer({ min: 0, max: possibleProductTypeIds.length - 1 })] : valueGenerator.string({ length }),
      generateFieldValueThatDoesNotMatchEnum: () => '123',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'productTypeGroup',
      enum: ENUMS.PRODUCT_TYPE_GROUPS,
      length: 2,
      generateFieldValueOfLength: (length: number) =>
        length === 2
          ? possibleProductTypeGroups[valueGenerator.integer({ min: 0, max: possibleProductTypeGroups.length - 1 })]
          : valueGenerator.string({ length }),
      generateFieldValueThatDoesNotMatchEnum: () => '12',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withCurrencyFieldValidationApiTests({
      valueGenerator,
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNumberFieldValidationApiTests({
      fieldName: 'dealCustomerUsageRate',
      required: false,
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'dealCustomerUsageOperationType',
      required: false,
      enum: ENUMS.OPERATION_TYPE_CODES,
      length: 1,
      generateFieldValueOfLength: (length: number) =>
        length === 1 ? possibleOperationTypes[valueGenerator.integer({ min: 0, max: possibleOperationTypes.length - 1 })] : valueGenerator.string({ length }),
      generateFieldValueThatDoesNotMatchEnum: () => '3',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'amount',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'issueDate',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'expiryDate',
      validRequestBody: requestBodyToCreateFacilityLoan,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  const givenRequestToCreateFacilityLoanInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityLoan().reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };

  const requestToCreateFacilityLoan = (): nock.Interceptor =>
    requestToCreateFacilityLoanInAcbsWithBody(JSON.parse(JSON.stringify(acbsRequestBodyToCreateFacilityLoan)));

  const requestToCreateFacilityLoanInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreateFacilityLoanInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };
});

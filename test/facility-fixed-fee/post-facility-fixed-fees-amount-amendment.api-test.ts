import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsPartyId } from '@ukef/helpers';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/party-identifier-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityFixedFeesAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-fixed-fees-amount-amendment.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/fixed-fees/amendments/amount', () => {
  const valueGenerator = new RandomValueGenerator();
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const createdBundleIdentifier = valueGenerator.acbsBundleId();
  const acbsSuccessfulResponse: [number, undefined, { BundleIdentifier: string }] = [201, undefined, { BundleIdentifier: createdBundleIdentifier }];
  const { increaseAmountRequest, decreaseAmountRequest, acbsFixedFeesAmendmentForIncrease, acbsFixedFeesAmendmentForDecrease } =
    new CreateFacilityFixedFeesAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({ numberToGenerate: 3, facilityIdentifier });

  const createFixedFeesAmountAmendmentUrl = ({ facilityId }: { facilityId: string } = { facilityId: facilityIdentifier }) =>
    `/api/v1/facilities/${facilityId}/fixed-fees/amendments/amount`;

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
    givenRequestWouldOtherwiseSucceed: () => requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse),
    makeRequest: () => api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns the bundleIdentifier of the created bundle in ACBS if creating an increase fixed fees amount amendment is successful', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);

    const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      bundleIdentifier: createdBundleIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('returns the bundleIdentifier of the created bundle in ACBS if creating a decrease fixed fees amount amendment is successful', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateDecreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);

    const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), decreaseAmountRequest);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      bundleIdentifier: createdBundleIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when creating the fixed fees advance transaction', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the facility fixed fees amount amendment', async () => {
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(
        400,
        `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`,
      );

      const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility fixed fees amount amendment', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility does not exist" when creating the facility fixed fees amount amendment', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility fixed fees amount amendment', async () => {
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility fixed fees amount amendment', async () => {
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs()
        .delay(TIME_EXCEEDING_ACBS_TIMEOUT)
        .reply(...acbsSuccessfulResponse);

      const { status, body } = await api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body) => api.post(createFixedFeesAmountAmendmentUrl(), body);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds();
    };

    withPartyIdentifierFieldValidationApiTests({
      fieldName: 'partyIdentifier',
      valueGenerator,
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'partyIdentifier',
      length: 8,
      required: true,
      generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }) as AcbsPartyId,
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'period',
      length: 2,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'lenderTypeCode',
      enum: ENUMS.LENDER_TYPE_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => '123',
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'effectiveDate',
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNumberFieldValidationApiTests({
      fieldName: 'amountAmendment',
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
      forbidZero: true,
    });
  });

  describe('URL parameter validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      makeRequestWithFacilityId: (facilityId: string) => api.post(createFixedFeesAmountAmendmentUrl({ facilityId }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds();
      },
      successStatusCode: 201,
    });
  });

  const requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsFixedFeesAmendmentForIncrease)));

  const requestToCreateDecreaseFixedFeesAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsFixedFeesAmendmentForDecrease)));

  const givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json')
      .reply(...acbsSuccessfulResponse);
  };

  const requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');
});

import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBundleIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/bundle-identifier-url-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/get-facility-activation-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/activation-transactions/{bundleIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const getGetFacilityActivationTransactionUrl = (facilityId: string, bundleId: string) =>
    `/api/v1/facilities/${facilityId}/activation-transactions/${bundleId}`;

  const getFacilityActivationTransactionUrl = getGetFacilityActivationTransactionUrl(facilityIdentifier, bundleIdentifier);

  const { acbsFacilityActivationTransaction, apiFacilityActivationTransaction } = new GetFacilityActivationTransactionGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetFacilityActivationTransactionInAcbsSucceeds();
    },
    makeRequest: () => api.get(getFacilityActivationTransactionUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityActivationTransactionInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getFacilityActivationTransactionUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the activation transaction if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityActivationTransactionInAcbsSucceeds();

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(apiFacilityActivationTransaction);
  });

  it(`returns a 400 response if the loan transaction is returned by ACBS and the 0th element of BundleMessageList is NOT a 'NewLoanRequest'`, async () => {
    const invalidloanTransactionInAcbs = JSON.parse(JSON.stringify(acbsFacilityActivationTransaction));
    invalidloanTransactionInAcbs.BundleMessageList.unshift({
      $type: 'AccrualScheduleAmountTransaction',
    });

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().reply(200, invalidloanTransactionInAcbs);

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      message: 'Bad request',
      error: 'The provided bundleIdentifier does not correspond to an activation transaction.',
    });
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().reply(400, 'BundleInformation not found or user does not have access to it.');

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response that is not a string when getting the activation transaction', async () => {
    const acbsErrorMessage = { Message: 'error message' };
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().reply(400, acbsErrorMessage);

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the activation transaction from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().reply(401);

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the activation transaction from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityActivationTransaction().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, acbsFacilityActivationTransaction);

    const { status, body } = await api.get(getFacilityActivationTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  describe('URL validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetFacilityActivationTransactionInAcbsSucceeds();
      },
      makeRequestWithFacilityId: (facilityId) => api.get(getGetFacilityActivationTransactionUrl(facilityId, bundleIdentifier)),
    });
    withBundleIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForBundleId: (bundleId: string) => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetFacilityActivationTransactionInAcbsSucceedsWithBundleId(bundleId);
      },
      makeRequestWithBundleId: (bundleId) => api.get(getGetFacilityActivationTransactionUrl(facilityIdentifier, bundleId)),
    });
  });

  const givenRequestToGetFacilityActivationTransactionInAcbsSucceeds = () =>
    givenRequestToGetFacilityActivationTransactionInAcbsSucceedsWithBundleId(bundleIdentifier);

  const givenRequestToGetFacilityActivationTransactionInAcbsSucceedsWithBundleId = (bundleId: string): nock.Scope => {
    return requestToGetFacilityActivationTransactionWithBundleId(bundleId).reply(200, acbsFacilityActivationTransaction);
  };

  const requestToGetFacilityActivationTransaction = () => requestToGetFacilityActivationTransactionWithBundleId(bundleIdentifier);

  const requestToGetFacilityActivationTransactionWithBundleId = (bundleId: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/BundleInformation/${bundleId}?returnItems=true`).matchHeader('authorization', `Bearer ${idToken}`);
});

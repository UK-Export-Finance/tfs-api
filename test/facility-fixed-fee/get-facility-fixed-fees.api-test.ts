import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityFixedFeeGenerator } from '@ukef-test/support/generator/get-facility-fixed-fee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/fixed-fees', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const getGetFacilityFixedFeesUrlForFacilityId = (facilityId: string) => `/api/v1/facilities/${facilityId}/fixed-fees`;

  const getFacilityFixedFeesUrl = getGetFacilityFixedFeesUrlForFacilityId(facilityIdentifier);

  const { apiFacilityFixedFees: expectedFacilityFixedFees, acbsFacilityFixedFees } = new GetFacilityFixedFeeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({ numberToGenerate: 2, facilityIdentifier, portfolioIdentifier });

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetFixedFeesForFacility().reply(200, acbsFacilityFixedFees),
    makeRequest: () => api.get(getFacilityFixedFeesUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetFixedFeesForFacility().reply(200, acbsFacilityFixedFees);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getFacilityFixedFeesUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withFacilityIdentifierUrlValidationApiTests({
    givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId) => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetFixedFeesForFacilityWithId(facilityId).reply(200, acbsFacilityFixedFees);
    },
    makeRequestWithFacilityId: (facilityId) => api.get(getGetFacilityFixedFeesUrlForFacilityId(facilityId)),
  });

  it('returns a 200 response with the facility fixed fees if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFixedFeesForFacility().reply(200, acbsFacilityFixedFees);

    const { status, body } = await api.get(getFacilityFixedFeesUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(expectedFacilityFixedFees);
  });

  it('returns a 200 response with an empty array if ACBS returns a 200 response with an empty array', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFixedFeesForFacility().reply(200, []);

    const { status, body } = await api.get(getFacilityFixedFeesUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if getting the facility fixed fees from ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFixedFeesForFacility().reply(401);

    const { status, body } = await api.get(getFacilityFixedFeesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the facility fixed fees from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFixedFeesForFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, acbsFacilityFixedFees);

    const { status, body } = await api.get(getFacilityFixedFeesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetFixedFeesForFacilityWithId = (facilityId: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/Fee`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const requestToGetFixedFeesForFacility = (): nock.Interceptor => requestToGetFixedFeesForFacilityWithId(facilityIdentifier);
});

import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierUrlParamValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-param-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier = valueGenerator.facilityId();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;

  const getGetFacilityGuaranteesUrlForFacilityId = (facilityId: string) => `/api/v1/facilities/${facilityId}/guarantees`;

  const getFacilityGuaranteesUrl = getGetFacilityGuaranteesUrlForFacilityId(facilityIdentifier);

  const { facilityGuarantees: expectedFacilityGuarantees, facilityGuaranteesInAcbs } = new GetFacilityGuaranteeGenerator(
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
    givenRequestWouldOtherwiseSucceed: () => requestToGetGuaranteesForFacility().reply(200, facilityGuaranteesInAcbs),
    makeRequest: () => api.get(getFacilityGuaranteesUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetGuaranteesForFacility().reply(200, facilityGuaranteesInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getFacilityGuaranteesUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withFacilityIdentifierUrlParamValidationApiTests({
    givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId) => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetGuaranteesForFacilityWithId(facilityId).reply(200, facilityGuaranteesInAcbs);
    },
    makeRequestWithFacilityId: (facilityId) => api.get(getGetFacilityGuaranteesUrlForFacilityId(facilityId)),
  });

  it('returns a 200 response with the facility guarantees if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacility().reply(200, facilityGuaranteesInAcbs);

    const { status, body } = await api.get(getFacilityGuaranteesUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(expectedFacilityGuarantees);
  });

  it('returns a 200 response with an empty array if ACBS returns a 200 response with an empty array', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacility().reply(200, []);

    const { status, body } = await api.get(getFacilityGuaranteesUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 404 response if ACBS returns a 200 response with null as the response body', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacility().reply(200, null);

    const { status, body } = await api.get(getFacilityGuaranteesUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if getting the facility guarantees from ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacility().reply(401);

    const { status, body } = await api.get(getFacilityGuaranteesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the facility guarantees from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityGuaranteesInAcbs);

    const { status, body } = await api.get(getFacilityGuaranteesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetGuaranteesForFacilityWithId = (facilityId: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/FacilityGuarantee`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const requestToGetGuaranteesForFacility = (): nock.Interceptor => requestToGetGuaranteesForFacilityWithId(facilityIdentifier);
});

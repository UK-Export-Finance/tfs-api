import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/covenants', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const facilityIdentifier = valueGenerator.ukefId();
  const getFacilityCovenantsUrl = `/api/v1/facilities/${facilityIdentifier}/covenants`;

  const { facilityCovenantsInAcbs, facilityCovenantsFromApi } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => requestToGetFacilityCovenants().reply(200, facilityCovenantsInAcbs),
    makeRequest: () => api.get(getFacilityCovenantsUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetFacilityCovenants().reply(200, facilityCovenantsInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getFacilityCovenantsUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility covenants if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityCovenants().reply(200, facilityCovenantsInAcbs);

    const { status, body } = await api.get(getFacilityCovenantsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(facilityCovenantsFromApi)));
  });

  it('returns a 200 response with an empty array if ACBS returns a 200 response with an empty array', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityCovenants().reply(200, []);

    const { status, body } = await api.get(getFacilityCovenantsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if getting the facility covenants from ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityCovenants().reply(401);

    const { status, body } = await api.get(getFacilityCovenantsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the facility covenants from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityCovenants().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityCovenantsInAcbs);

    const { status, body } = await api.get(getFacilityCovenantsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  // TO-DO: add tests that check we respond with 400 if the facilityId is of the wrong length/format once injectable tests for this
  // have been written.

  const requestToGetFacilityCovenants = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityInvestorGenerator } from '@ukef-test/support/generator/get-facility-investor-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/investors', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityIdentifier: UkefId = valueGenerator.ukefId();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const getFacilityInvestorsUrl = `/api/v1/facilities/${facilityIdentifier}/investors`;

  let api: Api;

  const { facilityInvestorsInAcbs, facilityInvestorsFromService } = new GetFacilityInvestorGenerator(valueGenerator).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    portfolioIdentifier,
  });

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetFacilityInvestors().reply(200, facilityInvestorsInAcbs),
    makeRequest: () => api.get(getFacilityInvestorsUrl),
  });

  it('returns a 200 response with the facility investors if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInvestors().reply(200, facilityInvestorsInAcbs);

    const { status, body } = await api.get(getFacilityInvestorsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(facilityInvestorsFromService)));
  });

  it('returns a 404 response if ACBS returns a 200 response with the string "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInvestors().reply(200, 'null');

    const { status, body } = await api.get(getFacilityInvestorsUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 200 response with string other than "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInvestors().reply(200, 'An error message from ACBS.');

    const { status, body } = await api.get(getFacilityInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInvestors().reply(401);

    const { status, body } = await api.get(getFacilityInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the facility investors from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInvestors().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityInvestorsInAcbs);

    const { status, body } = await api.get(getFacilityInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetFacilityInvestors = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /parties?searchText={searchText}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const searchText = valueGenerator.stringOfNumericCharacters({ minLength: 3 });
  const getPartiesBySearchTextUrl = `/api/v1/parties?searchText=${searchText}`;

  const { partiesInAcbs, parties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetPartiesBySearchText().reply(200, partiesInAcbs),
    makeRequest: () => api.get(getPartiesBySearchTextUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText().reply(200, partiesInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getPartiesBySearchTextUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(parties)));
  });

  it('returns a 200 response with an empty array of parties if ACBS returns a 200 response with an empty array of parties', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(200, []);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if ACBS returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(401);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the parties from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().delay(1500).reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 400 response if the request is sent to /parties', async () => {
    const { status, body } = await api.get(`/api/v1/parties`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if the request is sent to /parties?searchText', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if the request is sent to /parties?searchText=', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText=`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if searchText is less than 3 characters', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText=00`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  it('returns a 400 response if searchText is 3 whitespaces', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText=   `);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters'],
    });
  });

  const requestToGetPartiesBySearchText = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);
});

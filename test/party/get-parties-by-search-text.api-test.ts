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

  const { acbsParties, parties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetPartiesBySearchText(searchText).reply(200, acbsParties),
    makeRequest: () => api.get(getPartiesBySearchTextUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(searchText).reply(200, acbsParties);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getPartiesBySearchTextUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(searchText).reply(200, acbsParties);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(parties)));
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS and the search text has a whitespace in the middle and ends with a non-whitespace', async () => {
    const searchTextWithSpaces = 'Company Name';
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText('Company%20Name').reply(200, acbsParties);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchTextWithSpaces}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(parties)));
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS and the search text starts with a whitespace and ends with a non-whitespace', async () => {
    const searchTextWithLeadingSpace = ' endInNonWhitespace';
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText('%20endInNonWhitespace').reply(200, acbsParties);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchTextWithLeadingSpace}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(parties)));
  });

  it('returns a 200 response with an empty array of parties if ACBS returns a 200 response with an empty array of parties', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(searchText).reply(200, []);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if ACBS returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(searchText).reply(401);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the parties from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText(searchText).delay(1500).reply(200, acbsParties);

    const { status, body } = await api.get(getPartiesBySearchTextUrl);

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
      message: ['searchText must be a string', 'searchText must be longer than or equal to 3 characters', 'searchText must match /\\S$/ regular expression'],
    });
  });

  it('returns a 400 response if the request is sent to /parties?searchText', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters', 'searchText must match /\\S$/ regular expression'],
    });
  });

  it('returns a 400 response if the request is sent to /parties?searchText=', async () => {
    const { status, body } = await api.get(`/api/v1/parties?searchText=`);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must be longer than or equal to 3 characters', 'searchText must match /\\S$/ regular expression'],
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

  it('returns a 400 response if searchText ends with a whitespace', async () => {
    const { status, body } = await api.get(`/api/v1/parties`).query({ searchText: '   ' }); // superagent will trim the query string if we specify it in the path instead of in `query`

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['searchText must match /\\S$/ regular expression'],
    });
  });

  const requestToGetPartiesBySearchText = (search): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${search}`).matchHeader('authorization', `Bearer ${idToken}`);
});

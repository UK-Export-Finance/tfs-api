import { ACBS } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /parties?searchText={searchText}', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const sessionId = valueGenerator.string();
  const searchText = valueGenerator.stringOfNumericCharacters({ minLength: 3 });

  const partyAlternateIdentifierA = searchText + '0';
  const industryClassificationCodeA = valueGenerator.stringOfNumericCharacters();
  const partyName1A = valueGenerator.string();
  const partyName2A = valueGenerator.string();
  const partyName3A = valueGenerator.string();
  const minorityClassCodeA = valueGenerator.stringOfNumericCharacters();
  const citizenshipClassCodeA = valueGenerator.stringOfNumericCharacters();
  const officerRiskDateA = valueGenerator.date().toISOString();
  const countryCodeA = valueGenerator.string();

  const partyAlternateIdentifierB = searchText + '1';
  const industryClassificationCodeB = valueGenerator.stringOfNumericCharacters();
  const partyName1B = valueGenerator.string();
  const partyName2B = valueGenerator.string();
  const partyName3B = valueGenerator.string();
  const minorityClassCodeB = valueGenerator.stringOfNumericCharacters();
  const citizenshipClassCodeB = valueGenerator.stringOfNumericCharacters();
  const officerRiskDateB = valueGenerator.date().toISOString();
  const countryCodeB = valueGenerator.string();

  const partiesInAcbs = [
    {
      PartyAlternateIdentifier: partyAlternateIdentifierA,
      IndustryClassification: { IndustryClassificationCode: industryClassificationCodeA },
      PartyName1: partyName1A,
      PartyName2: partyName2A,
      PartyName3: partyName3A,
      MinorityClass: { MinorityClassCode: minorityClassCodeA },
      CitizenshipClass: { CitizenshipClassCode: citizenshipClassCodeA },
      OfficerRiskDate: officerRiskDateA,
      PrimaryAddress: { Country: { CountryCode: countryCodeA } },
    },
    {
      PartyAlternateIdentifier: partyAlternateIdentifierB,
      IndustryClassification: { IndustryClassificationCode: industryClassificationCodeB },
      PartyName1: partyName1B,
      PartyName2: partyName2B,
      PartyName3: partyName3B,
      MinorityClass: { MinorityClassCode: minorityClassCodeB },
      CitizenshipClass: { CitizenshipClassCode: citizenshipClassCodeB },
      OfficerRiskDate: officerRiskDateB,
      PrimaryAddress: { Country: { CountryCode: countryCodeB } },
    },
  ];

  const expectedParties = [
    {
      alternateIdentifier: partyAlternateIdentifierA,
      industryClassification: industryClassificationCodeA,
      name1: partyName1A,
      name2: partyName2A,
      name3: partyName3A,
      smeType: minorityClassCodeA,
      citizenshipClass: citizenshipClassCodeA,
      officerRiskDate: officerRiskDateA.slice(0, 10),
      countryCode: countryCodeA,
    },
    {
      alternateIdentifier: partyAlternateIdentifierB,
      industryClassification: industryClassificationCodeB,
      name1: partyName1B,
      name2: partyName2B,
      name3: partyName3B,
      smeType: minorityClassCodeB,
      citizenshipClass: citizenshipClassCodeB,
      officerRiskDate: officerRiskDateB.slice(0, 10),
      countryCode: countryCodeB,
    },
  ];

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

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText().reply(200, partiesInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(`/api/v1/parties?searchText=${searchText}`, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the matching parties if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedParties)));
  });

  it('returns a 200 response with an empty array of parties if ACBS returns a 200 response with an empty array of parties', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(200, []);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 500 response if creating a session with the IdP fails', async () => {
    const errorCode = valueGenerator.string();
    requestToCreateASessionWithTheIdp().reply(
      400,
      {
        errorCode: errorCode,
        errorStack: null,
        messages: [
          {
            code: errorCode,
            message: `${errorCode}: Invalid Credentials. (msg_id=${valueGenerator.string()})`,
            property: null,
          },
        ],
      },
      {
        'set-cookie': 'JSESSIONID=prelogin-1',
      },
    );

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP fails', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().reply(403, '<!doctype html><html><body><div>Access to the requested resource has been forbidden.</div></body></html>');

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(401);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if creating a session with the IdP times out', async () => {
    requestToCreateASessionWithTheIdp().delay(1500).reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
    givenGettingAnIdTokenFromTheIdpSucceeds();
    requestToGetPartiesBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP times out', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().delay(1500).reply(200, { id_token: idToken });
    requestToGetPartiesBySearchText().reply(200, partiesInAcbs);

    const { status, body } = await api.get(`/api/v1/parties?searchText=${searchText}`);

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

  const requestToCreateASessionWithTheIdp = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_BASE_URL)
      .post('/sessions', {
        loginName: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_LOGIN_NAME,
        password: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_PASSWORD,
      })
      .matchHeader('content-type', 'application/json')
      .matchHeader(ENVIRONMENT_VARIABLES.ACBS_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.ACBS_API_KEY);

  const givenCreatingASessionWithTheIdpSucceeds = (): void => {
    requestToCreateASessionWithTheIdp().reply(201, '', { 'set-cookie': `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=${sessionId}` });
  };

  const requestToGetAnIdTokenFromTheIdp = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_BASE_URL)
      .get(`/idptoken/openid-connect?client_id=${ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_CLIENT_ID}`)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .matchHeader(ENVIRONMENT_VARIABLES.ACBS_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.ACBS_API_KEY)
      .matchHeader('cookie', `${ACBS.AUTHENTICATION.SESSION_ID_COOKIE_NAME}=${sessionId}`);

  const givenGettingAnIdTokenFromTheIdpSucceeds = (): void => {
    requestToGetAnIdTokenFromTheIdp().reply(200, { id_token: idToken });
  };

  const givenAuthenticationWithTheIdpSucceeds = (): void => {
    givenCreatingASessionWithTheIdpSucceeds();
    givenGettingAnIdTokenFromTheIdpSucceeds();
  };

  const requestToGetPartiesBySearchText = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);
});

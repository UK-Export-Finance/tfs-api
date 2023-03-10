import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /deals', () => {
  const valueGenerator = new RandomValueGenerator();

  const portfolioIdentifier = 'E1';
  const idToken = valueGenerator.string();

  const postDealUrl = `/api/v1/deals`;
  const acbsDealResponse = {};
  const expectedDealIdentifierResponse = { dealIdentifier: '00001' };

  let api: Api;
  beforeAll(async () => {
    api = await Api.create();
  });
  afterAll(async () => {
    await api.destroy();
  });

  it('returns a 201 response with the identifier of the new deal if ACBS responds with 201', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealWithAcbs().reply(201, acbsDealResponse);

    const { status, body } = await api.post(postDealUrl);

    expect(status).toBe(201);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedDealIdentifierResponse)));
  });

  it('returns a 400 response if ACBS response with 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealWithAcbs().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.post(postDealUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
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
    requestToCreateASessionWithTheIdp().reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
  };

  const requestToGetAnIdTokenFromTheIdp = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_BASE_URL)
      .get(`/idptoken/openid-connect?client_id=${ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_CLIENT_ID}`)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .matchHeader(ENVIRONMENT_VARIABLES.ACBS_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.ACBS_API_KEY)
      .matchHeader('cookie', 'JSESSIONID=1');

  const givenGettingAnIdTokenFromTheIdpSucceeds = (): void => {
    requestToGetAnIdTokenFromTheIdp().reply(200, { id_token: idToken });
  };

  const givenAuthenticationWithTheIdpSucceeds = (): void => {
    givenCreatingASessionWithTheIdpSucceeds();
    givenGettingAnIdTokenFromTheIdpSucceeds();
  };

  const requestToCreateDealWithAcbs = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).post(`/Portfolio/${portfolioIdentifier}/Deal`).matchHeader('authorization', `Bearer ${idToken}`);
});

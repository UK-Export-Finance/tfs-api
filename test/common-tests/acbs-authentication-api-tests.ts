import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';
import request from 'supertest';

interface AcbsAuthenticationErrorCasesTestOptions {
  givenRequestWouldOtherwiseSucceed: () => void;
  makeRequest: () => request.Test;
}

interface AcbsAuthenticationTestHooks {
  idToken: string;
  givenAuthenticationWithTheIdpSucceeds: () => void;
}

// Note that these tests assume the caller will use nock to abort pending requests
// and clean all mocks after each test
export const withAcbsAuthenticationApiTests = ({
  givenRequestWouldOtherwiseSucceed,
  makeRequest,
}: AcbsAuthenticationErrorCasesTestOptions): AcbsAuthenticationTestHooks => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();

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
    givenRequestWouldOtherwiseSucceed();

    const { status, body } = await makeRequest();

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP fails', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().reply(403, '<!doctype html><html><body><div>Access to the requested resource has been forbidden.</div></body></html>');
    givenRequestWouldOtherwiseSucceed();

    const { status, body } = await makeRequest();

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP times out', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp()
      .delay(ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + 500)
      .reply(200, { id_token: idToken });
    givenRequestWouldOtherwiseSucceed();

    const { status, body } = await makeRequest();

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if creating a session with the IdP times out', async () => {
    requestToCreateASessionWithTheIdp()
      .delay(ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + 500)
      .reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
    givenGettingAnIdTokenFromTheIdpSucceeds();
    givenRequestWouldOtherwiseSucceed();

    const { status, body } = await makeRequest();

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

  return {
    idToken,
    givenAuthenticationWithTheIdpSucceeds,
  };
};

import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withPartyIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/party-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /parties/{partyIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const partyIdentifier = valueGenerator.acbsPartyId();
  const generateGetPartyUrl = (partyId: string): string => `/api/v1/parties/${partyId}`;
  const getPartyUrl = generateGetPartyUrl(partyIdentifier);

  let api: Api;

  const { acbsParties, apiParties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1 });
  const [acbsParty] = acbsParties;
  const [expectedParty] = apiParties;

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetParty().reply(200, acbsParty),
    makeRequest: () => api.get(getPartyUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetParty().reply(200, acbsParty);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => api.getWithoutAuth(getPartyUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the party if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetParty().reply(200, acbsParty);

    const { status, body } = await api.get(getPartyUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedParty)));
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetParty().reply(400, 'Party not found');

    const { status, body } = await api.get(getPartyUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetParty().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(getPartyUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the party from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetParty().reply(401);

    const { status, body } = await api.get(getPartyUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the party from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetParty().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, acbsParty);

    const { status, body } = await api.get(getPartyUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  withPartyIdentifierUrlValidationApiTests({
    makeRequestWithPartyId: (partyId: string) => api.get(generateGetPartyUrl(partyId)),
    givenRequestWouldOtherwiseSucceedForPartyId: (partyId) => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetParty(partyId).reply(200, acbsParty);
    },
  });

  const requestToGetParty = (partyId: string = partyIdentifier) =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyId}`).matchHeader('authorization', `Bearer ${idToken}`);
});

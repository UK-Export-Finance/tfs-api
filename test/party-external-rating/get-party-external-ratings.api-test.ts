import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetPartyExternalRatingGenerator } from '@ukef-test/support/generator/get-party-external-rating-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /parties/{partyIdentifier}/external-ratings', () => {
  const valueGenerator = new RandomValueGenerator();

  const partyIdentifier = '001';
  const { acbsExternalRatings, apiExternalRatings: expectedExternalRatings } = new GetPartyExternalRatingGenerator(valueGenerator).generate({
    partyIdentifier,
    numberToGenerate: 2,
  });

  const getPartyExternalRatingsUrl = `/api/v1/parties/${partyIdentifier}/external-ratings`;

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetExternalRatingsForParty().reply(200, acbsExternalRatings),
    makeRequest: () => api.get(getPartyExternalRatingsUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetExternalRatingsForParty().reply(200, acbsExternalRatings);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getPartyExternalRatingsUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the external ratings of the party if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(200, acbsExternalRatings);

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedExternalRatings)));
  });

  it('returns a 200 response with an empty array of external ratings if ACBS returns a 200 response with an empty array of external ratings', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(200, []);

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(400, 'Party not found');

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the external ratings from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(401);

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the external ratings from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, acbsExternalRatings);

    const { status, body } = await api.get(getPartyExternalRatingsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetExternalRatingsForParty = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyIdentifier}/PartyExternalRating`).matchHeader('authorization', `Bearer ${idToken}`);
});

import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/random-value-generator';
import nock from 'nock';

describe('GET /party/{partyIdentifier}/external-rating', () => {
  const valueGenerator = new RandomValueGenerator();

  const partyIdentifier = '001';
  const idToken = valueGenerator.string();

  const ratingEntityCodeA = valueGenerator.stringOfNumericCharacters();
  const assignedRatingCodeA = valueGenerator.stringOfNumericCharacters();
  const ratedDateA = valueGenerator.date();
  const probabilityofDefaultA = valueGenerator.probabilityFloat();
  const lossGivenDefaultA = valueGenerator.nonnegativeFloat();
  const riskWeightingA = valueGenerator.nonnegativeFloat();
  const externalRatingNote1A = valueGenerator.string();
  const externalRatingNote2A = valueGenerator.string();
  const externalRatingUserCode1A = valueGenerator.string();
  const externalRatingUserCode2A = valueGenerator.string();

  const ratingEntityCodeB = valueGenerator.stringOfNumericCharacters();
  const assignedRatingCodeB = valueGenerator.stringOfNumericCharacters();
  const ratedDateB = valueGenerator.date();
  const probabilityofDefaultB = valueGenerator.probabilityFloat();
  const lossGivenDefaultB = valueGenerator.nonnegativeFloat();
  const riskWeightingB = valueGenerator.nonnegativeFloat();
  const externalRatingNote1B = valueGenerator.string();
  const externalRatingNote2B = valueGenerator.string();
  const externalRatingUserCode1B = valueGenerator.string();
  const externalRatingUserCode2B = valueGenerator.string();

  const externalRatingsInAcbs = [
    {
      PartyIdentifier: partyIdentifier,
      RatingEntity: {
        RatingEntityCode: ratingEntityCodeA,
      },
      AssignedRating: {
        AssignedRatingCode: assignedRatingCodeA,
      },
      RatedDate: ratedDateA,
      ProbabilityofDefault: probabilityofDefaultA,
      LossGivenDefault: lossGivenDefaultA,
      RiskWeighting: riskWeightingA,
      ExternalRatingNote1: externalRatingNote1A,
      ExternalRatingNote2: externalRatingNote2A,
      ExternalRatingUserCode1: {
        UserCode1: externalRatingUserCode1A,
      },
      ExternalRatingUserCode2: {
        UserCode2: externalRatingUserCode2A,
      },
    },
    {
      PartyIdentifier: partyIdentifier,
      RatingEntity: {
        RatingEntityCode: ratingEntityCodeB,
      },
      AssignedRating: {
        AssignedRatingCode: assignedRatingCodeB,
      },
      RatedDate: ratedDateB,
      ProbabilityofDefault: probabilityofDefaultB,
      LossGivenDefault: lossGivenDefaultB,
      RiskWeighting: riskWeightingB,
      ExternalRatingNote1: externalRatingNote1B,
      ExternalRatingNote2: externalRatingNote2B,
      ExternalRatingUserCode1: {
        UserCode1: externalRatingUserCode1B,
      },
      ExternalRatingUserCode2: {
        UserCode2: externalRatingUserCode2B,
      },
    },
  ];

  const expectedExternalRatings = [
    {
      partyIdentifier: partyIdentifier,
      ratingEntity: {
        ratingEntityCode: ratingEntityCodeA,
      },
      assignedRating: {
        assignedRatingCode: assignedRatingCodeA,
      },
      ratedDate: ratedDateA,
      probabilityofDefault: probabilityofDefaultA,
      lossGivenDefault: lossGivenDefaultA,
      riskWeighting: riskWeightingA,
      externalRatingNote1: externalRatingNote1A,
      externalRatingNote2: externalRatingNote2A,
      externalRatingUserCode1: externalRatingUserCode1A,
      externalRatingUserCode2: externalRatingUserCode2A,
    },
    {
      partyIdentifier: partyIdentifier,
      ratingEntity: {
        ratingEntityCode: ratingEntityCodeB,
      },
      assignedRating: {
        assignedRatingCode: assignedRatingCodeB,
      },
      ratedDate: ratedDateB,
      probabilityofDefault: probabilityofDefaultB,
      lossGivenDefault: lossGivenDefaultB,
      riskWeighting: riskWeightingB,
      externalRatingNote1: externalRatingNote1B,
      externalRatingNote2: externalRatingNote2B,
      externalRatingUserCode1: externalRatingUserCode1B,
      externalRatingUserCode2: externalRatingUserCode2B,
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

  it('returns a 200 response with the external ratings of the party if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(200, externalRatingsInAcbs);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedExternalRatings)));
  });

  it('returns a 200 response with an empty array of external ratings if ACBS returns a 200 response with an empty array of external ratings', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(200, []);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

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

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP fails', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().reply(403, '<!doctype html><html><body><div>Access to the requested resource has been forbidden.</div></body></html>');

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(400, 'Party not found');

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "Party not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS if ACBS returns a status code that is not 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(401);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if creating a session with the IdP times out', async () => {
    requestToCreateASessionWithTheIdp().delay(1500).reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
    givenGettingAnIdTokenFromTheIdpSucceeds();
    requestToGetExternalRatingsForParty().reply(200, externalRatingsInAcbs);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting an id token from the IdP times out', async () => {
    givenCreatingASessionWithTheIdpSucceeds();
    requestToGetAnIdTokenFromTheIdp().delay(1500).reply(200, { id_token: idToken });
    requestToGetExternalRatingsForParty().reply(200, externalRatingsInAcbs);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the external ratings from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetExternalRatingsForParty().delay(1500).reply(200, externalRatingsInAcbs);

    const { status, body } = await api.get(`/api/v1/party/${partyIdentifier}/external-rating`);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToCreateASessionWithTheIdp = (): nock.Interceptor =>
    nock('https://test-acbs-authentication-url.com/base-url')
      .post('/sessions', { loginName: 'test acbs authentication login name', password: 'test acbs authentication password' })
      .matchHeader('content-type', 'application/json')
      .matchHeader('test-acbs-api-key-header-name', 'test acbs api key');

  const givenCreatingASessionWithTheIdpSucceeds = (): void => {
    requestToCreateASessionWithTheIdp().reply(201, '', { 'set-cookie': 'JSESSIONID=1' });
  };

  const requestToGetAnIdTokenFromTheIdp = (): nock.Interceptor =>
    nock('https://test-acbs-authentication-url.com/base-url')
      .get('/idptoken/openid-connect?client_id=test+acbs+authentication+client+id')
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .matchHeader('test-acbs-api-key-header-name', 'test acbs api key')
      .matchHeader('cookie', 'JSESSIONID=1');

  const givenGettingAnIdTokenFromTheIdpSucceeds = (): void => {
    requestToGetAnIdTokenFromTheIdp().reply(200, { id_token: idToken });
  };

  const givenAuthenticationWithTheIdpSucceeds = (): void => {
    givenCreatingASessionWithTheIdpSucceeds();
    givenGettingAnIdTokenFromTheIdpSucceeds();
  };

  const requestToGetExternalRatingsForParty = (): nock.Interceptor =>
    nock('https://test-acbs-url.com/base-url').get(`/Party/${partyIdentifier}/PartyExternalRating`).matchHeader('authorization', `Bearer ${idToken}`);
});

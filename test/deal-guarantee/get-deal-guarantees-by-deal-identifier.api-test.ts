import { PROPERTIES } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { GetDealGuaranteeGenerator } from '@ukef-test/support/generator/get-deal-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /deals/{dealIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();
  const dealIdentifier: UkefId = valueGenerator.ukefId();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const getDealGuaranteesUrl = `/api/v1/deals/${dealIdentifier}/guarantees`;

  let api: Api;

  const { dealGuaranteesInAcbs, dealGuaranteesFromService } = new GetDealGuaranteeGenerator(valueGenerator).generate({
    numberToGenerate: 2,
    dealIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => requestToGetDealGuarantees().reply(200, dealGuaranteesInAcbs),
    makeRequest: () => api.get(getDealGuaranteesUrl),
  });

  it('returns a 200 response with the deal guarantees if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees().reply(200, dealGuaranteesInAcbs);
    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(dealGuaranteesFromService)));
  });

  it('returns a 404 response if ACBS returns a 200 response with the string "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees().reply(200, 'null');

    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 204 response if ACBS returns a 200 response with the empty array', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees().reply(200, '[]');

    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(204);
    // TODO: we should return empty array, but it is not working at the moment.
    expect(body).toStrictEqual({});
  });

  it('returns a 500 response if ACBS returns a 200 response with string other than "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees().reply(200, 'An error message from ACBS.');

    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a 200 response but without required field', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const brokenDealGuaranteesInAcbs = [
      {
        EffectiveDate: valueGenerator.dateOnlyString(),
        ExpirationDate: valueGenerator.dateOnlyString(),
        IsExpirationDateMaximum: valueGenerator.boolean(),
        LimitAmount: valueGenerator.nonnegativeFloat({ fixed: 2 }),
      },
    ];

    requestToGetDealGuarantees().reply(200, brokenDealGuaranteesInAcbs);

    const { status, body } = await api.get(getDealGuaranteesUrl);
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 200 response even if most fields are missing', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const brokenDealGuaranteeInAcbs = [
      {
        GuarantorParty: { PartyIdentifier: valueGenerator.acbsPartyId() },
        GuaranteeType: { GuaranteeTypeCode: valueGenerator.string({ length: 3 }) },
      },
    ];

    requestToGetDealGuarantees().reply(200, brokenDealGuaranteeInAcbs);

    const { status } = await api.get(getDealGuaranteesUrl);
    expect(status).toBe(200);
  });

  it('returns a 500 response if ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees().reply(401);

    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the party from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealGuarantees()
      .delay(ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + 500)
      .reply(200, dealGuaranteesInAcbs);

    const { status, body } = await api.get(getDealGuaranteesUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetDealGuarantees = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

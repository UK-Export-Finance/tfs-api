import { UkefId } from '@ukef/helpers';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

import { DealInvestorGenerator } from '../support/generator/deal-investor-generator';

describe('GET /deals/{dealIdentifier}/deal-investors', () => {
  const valueGenerator = new RandomValueGenerator();
  // TODO: Get portfolio default value from default constants;
  const dealIdentifier: UkefId = valueGenerator.ukefId();
  const portfolioIdentifier = 'E1';
  const getDealInvestorsUrl = `/api/v1/deals/${dealIdentifier}/investors`;

  let api: Api;

  const { dealInvestorsInAcbs, dealInvestorsFromService } = new DealInvestorGenerator(valueGenerator).generate({
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
    givenRequestWouldOtherwiseSucceed: () => requestToGetDealInvestors().reply(200, dealInvestorsInAcbs),
    makeRequest: () => api.get(getDealInvestorsUrl),
  });

  it('returns a 200 response with the deal investors if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealInvestors().reply(200, dealInvestorsInAcbs);

    const { status, body } = await api.get(getDealInvestorsUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(dealInvestorsFromService)));
  });

  it('returns a 404 response if ACBS returns a 200 response with the string "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealInvestors().reply(200, 'null');

    const { status, body } = await api.get(getDealInvestorsUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 200 response with string other than "null"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealInvestors().reply(200, 'An error message from ACBS.');

    const { status, body } = await api.get(getDealInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a 200 response but without required field', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const brokenDealInvestorsInAcbs = [
      {
        EffectiveDate: valueGenerator.dateString(),
        ExpirationDate: valueGenerator.dateString(),
        IsExpirationDateMaximum: valueGenerator.boolean(),
        LimitAmount: valueGenerator.nonnegativeFloat(2),
      },
    ];

    requestToGetDealInvestors().reply(200, brokenDealInvestorsInAcbs);

    const { status, body } = await api.get(getDealInvestorsUrl);
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 200 response even if most fields are missing', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const brokenDealInvestorsInAcbs = [
      {
        LenderType: { LenderTypeCode: valueGenerator.nonnegativeFloat(2) },
      },
    ];

    requestToGetDealInvestors().reply(200, brokenDealInvestorsInAcbs);

    const { status } = await api.get(getDealInvestorsUrl);
    expect(status).toBe(200);
  });

  it('returns a 500 response if ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealInvestors().reply(401);

    const { status, body } = await api.get(getDealInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the party from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDealInvestors()
      .delay(ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + 500)
      .reply(200, dealInvestorsInAcbs);

    const { status, body } = await api.get(getDealInvestorsUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetDealInvestors = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealParty`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

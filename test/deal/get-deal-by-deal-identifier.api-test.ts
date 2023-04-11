import { PROPERTIES } from '@ukef/constants';
import { AcbsGetDealResponseDto } from '@ukef/modules/acbs/dto/acbs-get-deal-response.dto';
import { GetDealByIdentifierResponse } from '@ukef/modules/deal/dto/get-deal-by-identifier-response.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /deals/{dealIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();

  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ length: 10 });
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
  const dealValue = valueGenerator.nonnegativeFloat();
  const guaranteeCommencementDateInAcbs = '2023-02-01T00:00:00Z';
  const guaranteeCommencementDateOnly = '2023-02-01';
  const obligorPartyIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const obligorName = valueGenerator.string();
  const obligorIndustryClassification = valueGenerator.string();

  const getDealUrl = `/api/v1/deals/${dealIdentifier}`;

  let api: Api;

  const dealInAcbs: AcbsGetDealResponseDto = {
    DealIdentifier: dealIdentifier,
    PortfolioIdentifier: portfolioIdentifier,
    Currency: {
      CurrencyCode: currency,
    },
    OriginalEffectiveDate: guaranteeCommencementDateInAcbs,
    MemoLimitAmount: dealValue,
    IndustryClassification: {
      IndustryClassificationCode: obligorIndustryClassification,
    },
    BorrowerParty: {
      PartyName1: obligorName,
      PartyIdentifier: obligorPartyIdentifier,
    },
  };

  const expectedDeal: GetDealByIdentifierResponse = {
    dealIdentifier,
    portfolioIdentifier,
    currency,
    dealValue,
    guaranteeCommencementDate: guaranteeCommencementDateOnly,
    obligorPartyIdentifier,
    obligorName,
    obligorIndustryClassification,
  };

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetDeal().reply(200, dealInAcbs),
    makeRequest: () => api.get(getDealUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetDeal().reply(200, dealInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => api.getWithoutAuth(getDealUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the deal if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDeal().reply(200, dealInAcbs);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(expectedDeal);
  });

  it(`returns a 200 response with '' as the obligorName if it is null in ACBS`, async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const dealInAcbsWithNullPartyName: AcbsGetDealResponseDto = {
      ...dealInAcbs,
      BorrowerParty: { ...dealInAcbs.BorrowerParty, PartyName1: null },
    };
    requestToGetDeal().reply(200, dealInAcbsWithNullPartyName);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(200);
    expect(body.obligorName).toBe('');
  });

  it(`returns a 200 response with '' as the obligorIndustryClassification if it is null in ACBS`, async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const dealInAcbsWithNullIndustryClassification: AcbsGetDealResponseDto = {
      ...dealInAcbs,
      IndustryClassification: { IndustryClassificationCode: null },
    };
    requestToGetDeal().reply(200, dealInAcbsWithNullIndustryClassification);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(200);
    expect(body.obligorIndustryClassification).toBe('');
  });

  it(`returns a 200 response with null as the guaranteeCommencementDate if it is null in ACBS`, async () => {
    // TODO APIM-80: is this date ever null in ACBS?
    givenAuthenticationWithTheIdpSucceeds();
    const dealInAcbsWithNullCommencementDate: AcbsGetDealResponseDto = {
      ...dealInAcbs,
      OriginalEffectiveDate: null,
    };
    requestToGetDeal().reply(200, dealInAcbsWithNullCommencementDate);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(200);
    expect(body.guaranteeCommencementDate).toBeNull();
  });

  it('returns a 404 response if ACBS returns a 200 response with null as the response body', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDeal().reply(200, null);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if getting the party from ACBS returns a status code that is NOT 200', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDeal().reply(401);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the deal from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetDeal().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, dealInAcbs);

    const { status, body } = await api.get(getDealUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetDeal = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}`).matchHeader('authorization', `Bearer ${idToken}`);
});

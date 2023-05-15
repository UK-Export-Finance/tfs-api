import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityLoanGenerator } from '@ukef-test/support/generator/get-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/loans', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const facilityIdentifier = valueGenerator.facilityId();
  const postFacilityLoansUrl = `/api/v1/facilities/${facilityIdentifier}/loans`;

  const { facilityLoansInAcbs, facilityLoansFromApi } = new CreateFacilityLoanGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    // bundleIdentifier,
    // borrowerPartyIdentifier,
    // effectiveDate,
  });

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetFacilityLoans().reply(200, facilityLoansInAcbs),
    makeRequest: () => api.get(postFacilityLoansUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetFacilityLoans().reply(200, facilityLoansInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(postFacilityLoansUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility loans if they are returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoans().reply(200, facilityLoansInAcbs);

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(facilityLoansFromApi)));
  });

  it('returns a 200 response with an empty array if ACBS returns a 200 response with an empty array', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoans().reply(200, []);

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual([]);
  });

  it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoans().reply(400, 'Facility not found or user does not have access to it.');

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it('returns a 500 response if ACBS responds with a 400 response that is a string that does not contain "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToGetFacilityLoans().reply(400, acbsErrorMessage);

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
  });

  it('returns a 500 response if getting the facility loans from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoans().reply(401);

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the facility loans from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoans().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityLoansInAcbs);

    const { status, body } = await api.get(postFacilityLoansUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  // TODO APIM-126: add tests that check we respond with 400 if the facilityId is of the wrong length/format once injectable tests for this
  // have been written.

  const requestToGetFacilityLoans = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Loan`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

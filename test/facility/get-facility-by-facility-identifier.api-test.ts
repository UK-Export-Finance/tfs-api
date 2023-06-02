import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { withAcbsGetFacilityServiceCommonTests } from '@ukef-test/common-tests/acbs-get-facility-by-identifier-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();
  const getFacilityUrl = `/api/v1/facilities/${facilityIdentifier}`;

  const { facilitiesInAcbs, facilitiesFromApi } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const [facilityInAcbs] = facilitiesInAcbs;
  const [expectedFacility] = facilitiesFromApi;

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToGetFacilityInAcbsSucceeds(),
    makeRequest: () => makeRequest(),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetFacilityInAcbs().reply(200, facilityInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) => api.getWithoutAuth(getFacilityUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbs);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacility)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and OriginalEffectiveDate is null', async () => {
    const facilityInAcbsWithNullOriginalEffectiveDate = { ...facilityInAcbs, OriginalEffectiveDate: null };
    const expectedFacilityWithNullEffectiveDate = { ...expectedFacility, effectiveDate: null };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullOriginalEffectiveDate);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithNullEffectiveDate)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and ExpirationDate is null', async () => {
    const facilityInAcbsWithNullExpirationDate = { ...facilityInAcbs, ExpirationDate: null };
    const expectedFacilityWithNullGuaranteeExpiryDate = { ...expectedFacility, guaranteeExpiryDate: null };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullExpirationDate);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithNullGuaranteeExpiryDate)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and UserDefinedDate1 is null', async () => {
    const facilityInAcbsWithNullUserDefinedDate1 = { ...facilityInAcbs, UserDefinedDate1: null };
    const expectedFacilityWithNullIssueDate = { ...expectedFacility, issueDate: null };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullUserDefinedDate1);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithNullIssueDate)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and UserDefinedDate2 is null', async () => {
    const facilityInAcbsWithNullUserDefinedDate2 = { ...facilityInAcbs, UserDefinedDate2: null };
    const expectedFacilityWithNullGuaranteeCommencementDateAndNextQuarterEndDate = {
      ...expectedFacility,
      guaranteeCommencementDate: null,
      nextQuarterEndDate: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullUserDefinedDate2);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithNullGuaranteeCommencementDateAndNextQuarterEndDate)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and CompBalPctReserve is null', async () => {
    const facilityInAcbsWithNullCompBalPctReserve1 = { ...facilityInAcbs, CompBalPctReserve: null };
    const expectedFacilityWithDefaultGuaranteePercentage = { ...expectedFacility, guaranteePercentage: PROPERTIES.FACILITY.DEFAULT.GET.compBalPctReserve };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullCompBalPctReserve1);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithDefaultGuaranteePercentage)));
  });

  it('returns a 200 response with the facility if it is returned by ACBS and CompBalPctAmount is null', async () => {
    const facilityInAcbsWithNullCompBalPctAmount = { ...facilityInAcbs, CompBalPctAmount: null };
    const expectedFacilityWithDefaultForeCastPercentage = { ...expectedFacility, forecastPercentage: PROPERTIES.FACILITY.DEFAULT.GET.compBalPctAmount };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityInAcbs().reply(200, facilityInAcbsWithNullCompBalPctAmount);

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityWithDefaultForeCastPercentage)));
  });

  withAcbsGetFacilityServiceCommonTests({
    givenTheRequestWouldOtherwiseSucceed: () => givenAuthenticationWithTheIdpSucceeds(),
    requestToGetFacilityInAcbs: () => requestToGetFacilityInAcbs(),
    makeRequest: () => makeRequest(),
  });

  const requestToGetFacilityInAcbs = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToGetFacilityInAcbsSucceeds = () => requestToGetFacilityInAcbs().reply(200, facilityInAcbs);
  const makeRequest = () => api.get(getFacilityUrl);
});

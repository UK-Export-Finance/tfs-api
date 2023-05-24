import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBaseFacilityFieldsValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/base-facility-fields-validation-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';
import supertest from 'supertest';

describe('POST /facilities', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();

  const createFacilityUrl = `/api/v1/facilities`;

  const { createFacilityRequestItem, acbsCreateFacilityRequest: expectedAcbsCreateFacilityRequest } = new CreateFacilityGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({ numberToGenerate: 1, facilityIdentifier });

  const requestBodyToCreateFacility = [createFacilityRequestItem];

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateFacilityInAcbsSucceeds(),
    makeRequest: () => api.post(createFacilityUrl, requestBodyToCreateFacility),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFacilityUrl, [createFacilityRequestItem], incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the facility identifier if the facility has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateFacilityInAcbsSucceeds();

    const { status, body } = await api.post(createFacilityUrl, requestBodyToCreateFacility);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('returns a 400 response if ACBS responds with a 400 response', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateFacility().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createFacilityUrl, requestBodyToCreateFacility);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacility().reply(401, 'Unauthorized');

    const { status, body } = await api.post(createFacilityUrl, requestBodyToCreateFacility);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  it('returns a 500 response if creating the facility in ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

    const { status, body } = await api.post(createFacilityUrl, requestBodyToCreateFacility);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const makeRequest = (body: unknown[]): supertest.Test => api.post(createFacilityUrl, body);

  const givenAnyRequestBodyWouldSucceed = () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenAnyRequestBodyToCreateFacilityInAcbsSucceeds();
  };

  withBaseFacilityFieldsValidationApiTests({ valueGenerator, validRequestBody: requestBodyToCreateFacility, makeRequest, givenAnyRequestBodyWouldSucceed });

  withFacilityIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  const givenRequestToCreateFacilityInAcbsSucceeds = () =>
    requestToCreateFacility().reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
    });

  const requestToCreateFacility = () => requestToCreateFacilityWithBody(JSON.parse(JSON.stringify(expectedAcbsCreateFacilityRequest)));

  const requestToCreateFacilityWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).post(`/Portfolio/${portfolioIdentifier}/Facility`, requestBody).matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestBodyToCreateFacilityInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Facility`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, {
        location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
      });
  };
});

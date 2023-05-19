import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBaseFacilityFieldsValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/base-facility-fields-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import nock from 'nock';
import supertest from 'supertest';

describe('PUT /facilities?op=ISSUE', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const facilityIdentifier = valueGenerator.facilityId();

  const updateFacilityUrl = `/api/v1/facilities/${facilityIdentifier}`;
  const issueFacilityUrl = updateFacilityUrl + `?op=${ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE}`;
  const InvalidUpdateFacilityUrl = updateFacilityUrl + `?op=invalidEnum`;
  const unissuedFacilityStageCode = TEST_FACILITY_STAGE_CODE.unissuedFacilityStageCode;

  const {
    updateFacilityRequest,
    acbsGetExistingFacilityResponse,
    acbsUpdateFacilityRequest: expectedAcbsUpdateFacilityRequest,
  } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1, facilityIdentifier });

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
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetFacilityInAcbsSucceeds();
      givenRequestToUpdateFacilityInAcbsSucceeds();
    },
    makeRequest: () => api.put(issueFacilityUrl, updateFacilityRequest),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityInAcbsSucceeds();
      givenRequestToUpdateFacilityInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.putWithoutAuth(updateFacilityUrl, updateFacilityRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility identifier if the facility has been successfully updated in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsGetRequest = givenRequestToGetFacilityInAcbsSucceeds();
    const acbsPutRequest = givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });

    expect(acbsGetRequest.isDone()).toBe(true);
    expect(acbsPutRequest.isDone()).toBe(true);
  });

  it('returns a 404 response if ACBS get facility returns a 400 response with the string "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacility().reply(400, 'The facility not found');
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS get facility returns a 400 response without the string "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacility().reply(400, 'An error message from ACBS.');
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS get facility responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const acbsErrorMessage = { Message: 'error message' };
    requestToGetFacility().reply(400, acbsErrorMessage);

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  it('returns a 500 response if ACBS get facility responds with a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacility().reply(401);
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS get facility times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, issueFacilityUrl);
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 400 response if ACBS update endpoint responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();

    const acbsErrorMessage = { Message: 'error message' };
    requestToUpdateFacility().reply(400, acbsErrorMessage);
    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if request has an unissued facility stage code"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, facilityStageCode: unissuedFacilityStageCode };

    const { status, body } = await api.put(issueFacilityUrl, modifiedUpdateFacilityRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: 'Facility stage code is not issued', statusCode: 400 });
  });

  it('returns a 400 response if ACBS update endpoint responds with a 400 response without the string "The Facility not found or the user does not have access to it."', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();

    requestToUpdateFacility().reply(400, 'error message');

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ statusCode: 400, message: 'Bad request', error: 'error message' });
  });

  it('returns a 404 response if ACBS update endpoint responds with a 400 response with the string "The Facility not found or the user does not have access to it."', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();

    requestToUpdateFacility().reply(400, 'The Facility not found or the user does not have access to it.');

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ statusCode: 404, message: 'Not found' });
  });

  it('returns a 500 response if ACBS update endpoint responds with an error code that is not 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();

    requestToUpdateFacility().reply(401, 'Unauthorized');

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  it('returns a 500 response if creating the facility in ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();
    requestToUpdateFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200);

    const { status, body } = await api.put(issueFacilityUrl, updateFacilityRequest);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 400 response if the query parameter is not supported', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityInAcbsSucceeds();
    givenRequestToUpdateFacilityInAcbsSucceeds();

    const { status, body } = await api.put(InvalidUpdateFacilityUrl, updateFacilityRequest);

    expect(status).toBe(400);
    expect(body).toMatchObject({
      error: 'Bad Request',
      message: expect.arrayContaining([`op must be one of the following values: issue`]),
      statusCode: 400,
    });
  });

  const makeRequest = (body: unknown): supertest.Test => api.put(issueFacilityUrl, JSON.parse(JSON.stringify(body)));

  const givenAnyRequestBodyWouldSucceed = () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenAnyRequestToGetFacilityInAcbsSucceeds();
    givenAnyRequestBodyToUpdateFacilityInAcbsSucceeds();
  };

  withBaseFacilityFieldsValidationApiTests({ valueGenerator, validRequestBody: updateFacilityRequest, makeRequest, givenAnyRequestBodyWouldSucceed });

  withDateOnlyFieldValidationApiTests({ fieldName: 'issueDate', validRequestBody: updateFacilityRequest, makeRequest, givenAnyRequestBodyWouldSucceed });

  const givenRequestToUpdateFacilityInAcbsSucceeds = () =>
    requestToUpdateFacility().reply(200, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
    });

  const givenRequestToGetFacilityInAcbsSucceeds = () => requestToGetFacility().reply(200, acbsGetExistingFacilityResponse);

  const requestToUpdateFacility = () => requestToUpdateFacilityWithBody(JSON.parse(JSON.stringify(expectedAcbsUpdateFacilityRequest)));

  const requestToUpdateFacilityWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestToGetFacilityInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, acbsGetExistingFacilityResponse, { location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}` });
  };

  const givenAnyRequestBodyToUpdateFacilityInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, {
        location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
      });
  };

  const requestToGetFacility = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);
});

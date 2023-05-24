import { PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityCovenantsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-covenants-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('PATCH /facilities/{facilityIdentifier}/covenants', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const expirationDateOnlyString = valueGenerator.dateOnlyString();
  const expirationDateTimeString = dateStringTransformations.addTimeToDateOnlyString(expirationDateOnlyString);
  const targetAmount = valueGenerator.nonnegativeFloat();
  const requestBodyToUpdateFacilityCovenant = { expirationDate: expirationDateOnlyString, targetAmount };

  const getUpdateFacilityCovenantUrlForFacilityId = (facilityId: string) => `/api/v1/facilities/${facilityId}/covenants`;

  const updateFacilityCovenantUrl = getUpdateFacilityCovenantUrlForFacilityId(facilityIdentifier);

  const { facilityCovenantsInAcbs } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 3,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const updatedCovenants = [
    { ...facilityCovenantsInAcbs[0], ExpirationDate: expirationDateTimeString, TargetAmount: targetAmount },
    { ...facilityCovenantsInAcbs[1], ExpirationDate: expirationDateTimeString, TargetAmount: targetAmount },
    { ...facilityCovenantsInAcbs[2], ExpirationDate: expirationDateTimeString, TargetAmount: targetAmount },
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

  const { idToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetCovenantsSucceeds();
      givenAllRequestsToReplaceCovenantsSucceed();
    },
    makeRequest: () => api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      givenAllRequestsToReplaceCovenantsSucceed();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.patchWithoutAuth(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility identifier if getting the facility covenants succeeds and the facility covenants have been successfully updated in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetCovenantsSucceeds();
    const acbsRequests = givenAllRequestsToReplaceCovenantsSucceed();

    const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequests[0].isDone()).toBe(true);
    expect(acbsRequests[1].isDone()).toBe(true);
    expect(acbsRequests[2].isDone()).toBe(true);
  });

  describe('error cases when getting the facility covenants', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAllRequestsToReplaceCovenantsSucceed();
    });

    it('returns a 500 response if ACBS responds with an error code that is not 200 when getting the facility covenants', async () => {
      requestToGetCovenantsForFacilityWithId(facilityIdentifier).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });
  });

  describe('error cases when replacing the first facility covenant', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[1]);
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[2]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[0]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[0]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[0]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[0]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[0]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when replacing the last facility covenant', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[0]);
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[1]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[2]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[2]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[2]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[2]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[2]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when replacing a middle facility covenant', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[0]);
      givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[2]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[1]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[1]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[1]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[1]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[1]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.patch(updateFacilityCovenantUrl, body);
    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      givenAnyRequestBodyToReplaceCovenantsSucceeds();
      givenAnyRequestBodyToReplaceCovenantsSucceeds();
      givenAnyRequestBodyToReplaceCovenantsSucceeds();
    };

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'targetAmount',
      required: false,
      validRequestBody: requestBodyToUpdateFacilityCovenant,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'expirationDate',
      required: false,
      nullable: false,
      validRequestBody: requestBodyToUpdateFacilityCovenant,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    it('returns a 400 response if the request body is the empty object', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status, body } = await api.patch(updateFacilityCovenantUrl, {});

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'The request body cannot be the empty object.', error: 'Bad Request', statusCode: 400 });
    });

    it('returns a 400 response if the request body is an array', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status, body } = await api.patch(updateFacilityCovenantUrl, [{ x: 1 }]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'The request body cannot be an array.', error: 'Bad Request', statusCode: 400 });
    });

    it('returns a 400 response if the request body is a string', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status } = await api.patch(updateFacilityCovenantUrl, 'test string');

      expect(status).toBe(400);
    });

    it('returns a 400 response if the request body is a number', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status } = await api.patch(updateFacilityCovenantUrl, JSON.stringify(2));

      expect(status).toBe(400);
    });

    it('returns a 400 response if the request body is null', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status } = await api.patch(updateFacilityCovenantUrl, null);

      expect(status).toBe(400);
    });

    it('returns a 400 response if the request body is the boolean value true', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status } = await api.patch(updateFacilityCovenantUrl, JSON.stringify(true));

      expect(status).toBe(400);
    });

    it('returns a 400 response if the request body is the boolean value false', async () => {
      givenAnyRequestBodyWouldSucceed();

      const { status } = await api.patch(updateFacilityCovenantUrl, JSON.stringify(false));

      expect(status).toBe(400);
    });
  });

  describe('URL validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId) => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetCovenantsSucceedsForFacilityWithId(facilityId);
        givenAllRequestsToReplaceCovenantsSucceedForFacilityWithId(facilityId);
      },
      makeRequestWithFacilityId: (facilityId) => api.patch(getUpdateFacilityCovenantUrlForFacilityId(facilityId), requestBodyToUpdateFacilityCovenant),
    });
  });

  const givenRequestToGetCovenantsSucceeds = () => givenRequestToGetCovenantsSucceedsForFacilityWithId(facilityIdentifier);

  const givenRequestToGetCovenantsSucceedsForFacilityWithId = (facilityId: string): nock.Scope => {
    return requestToGetCovenantsForFacilityWithId(facilityId).reply(200, facilityCovenantsInAcbs);
  };

  const requestToGetCovenantsForFacilityWithId = (facilityId: string) =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/Covenant`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenAllRequestsToReplaceCovenantsSucceed = () => givenAllRequestsToReplaceCovenantsSucceedForFacilityWithId(facilityIdentifier);

  const givenAllRequestsToReplaceCovenantsSucceedForFacilityWithId = (facilityId: string): nock.Scope[] => [
    givenRequestToReplaceCovenantSucceeds(facilityId, updatedCovenants[0]),
    givenRequestToReplaceCovenantSucceeds(facilityId, updatedCovenants[1]),
    givenRequestToReplaceCovenantSucceeds(facilityId, updatedCovenants[2]),
  ];

  const givenRequestToReplaceCovenantSucceeds = (facilityId: string, requestBody: AcbsGetFacilityCovenantsResponseDto): nock.Scope => {
    return requestToReplaceCovenant(facilityId, requestBody).reply(200);
  };

  const requestToReplaceCovenant = (facilityId: string, requestBody: AcbsGetFacilityCovenantsResponseDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/Covenant`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToReplaceCovenantsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200);
  };
});

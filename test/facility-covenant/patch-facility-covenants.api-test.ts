import { PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityCovenantsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-covenants-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityCovenantGenerator } from '@ukef-test/support/generator/get-facility-covenant-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('PATCH /facilities/{facilityIdentifier}/covenants', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const updateFacilityCovenantUrl = `/api/v1/facilities/${facilityIdentifier}/covenants`;

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const expirationDateOnlyString = valueGenerator.dateOnlyString();
  const expirationDateTimeString = dateStringTransformations.addTimeToDateOnlyString(expirationDateOnlyString);
  const targetAmount = valueGenerator.nonnegativeFloat();
  const requestBodyToUpdateFacilityCovenant = { expirationDate: expirationDateOnlyString, targetAmount };

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
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]);
    },
    makeRequest: () => api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.patchWithoutAuth(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility identifier if getting the facility covenants succeeds and the facility covenants have been successfully updated in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
    const acbsRequests = [
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]),
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]),
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]),
    ];

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
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]);
    });

    it('returns a 500 response if ACBS responds with an error code that is not 200 when getting the facility covenants', async () => {
      requestToGetFacilityCovenants().reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });
  });

  describe('error cases when replacing the first facility covenant', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[0]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[0]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[0]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[0]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[0]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

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
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[1]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[2]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[2]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[2]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[2]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[2]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

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
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[0]);
      givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody(updatedCovenants[2]);
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[1]).reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[1]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[1]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[1]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceFacilityCovenantWithBody(updatedCovenants[1]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

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
      givenRequestToGetFacilityCovenantsFromAcbsSucceeds();
      givenAnyRequestBodyToReplaceFacilityCovenantInAcbsSucceeds();
      givenAnyRequestBodyToReplaceFacilityCovenantInAcbsSucceeds();
      givenAnyRequestBodyToReplaceFacilityCovenantInAcbsSucceeds();
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
  });

  // TODO APIM-119: add tests that check we respond with 400 if the facilityId is of the wrong length/format once injectable tests for this
  // have been written.

  const givenRequestToGetFacilityCovenantsFromAcbsSucceeds = (): nock.Scope =>
    givenRequestToGetFacilityCovenantsFromAcbsSucceedsReturning(facilityCovenantsInAcbs);

  const givenRequestToGetFacilityCovenantsFromAcbsSucceedsReturning = (acbsFacilityCovenants: AcbsGetFacilityCovenantsResponseDto[]): nock.Scope => {
    return requestToGetFacilityCovenants().reply(200, acbsFacilityCovenants);
  };

  const requestToGetFacilityCovenants = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToReplaceFacilityCovenantInAcbsSucceedsWithBody = (requestBody: AcbsGetFacilityCovenantsResponseDto): nock.Scope => {
    return requestToReplaceFacilityCovenantWithBody(requestBody).reply(200);
  };

  const requestToReplaceFacilityCovenantWithBody = (requestBody: AcbsGetFacilityCovenantsResponseDto): nock.Interceptor =>
    requestToReplaceFacilityCovenantInAcbsWithBody(requestBody);

  const requestToReplaceFacilityCovenantInAcbsWithBody = (requestBody: AcbsGetFacilityCovenantsResponseDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToReplaceFacilityCovenantInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200);
  };
});

import { PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityGuaranteeDto } from '@ukef/modules/acbs/dto/acbs-get-facility-guarantees-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonEmptyObjectRequestValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-empty-object-request-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityGuaranteeGenerator } from '@ukef-test/support/generator/get-facility-guarantee-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('PATCH /facilities/{facilityIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const expirationDateOnlyString = valueGenerator.dateOnlyString();
  const expirationDateTimeString = dateStringTransformations.addTimeToDateOnlyString(expirationDateOnlyString);
  const guaranteedLimit = valueGenerator.nonnegativeFloat();
  const requestBodyToUpdateFacilityGuarantees = { expirationDate: expirationDateOnlyString, guaranteedLimit };
  const getUpdateFacilityGuaranteeUrlForFacilityId = (facilityId: string) => `/api/v1/facilities/${facilityId}/guarantees`;
  const numberOfGuaranteesForFacility = 3;

  const updateFacilityGuaranteesUrl = getUpdateFacilityGuaranteeUrlForFacilityId(facilityIdentifier);

  const { facilityGuaranteesInAcbs } = new GetFacilityGuaranteeGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: numberOfGuaranteesForFacility,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const guaranteesWithOnlyExpirationDateUpdated = facilityGuaranteesInAcbs.map((guaranteeInAcbs) => ({
    ...guaranteeInAcbs,
    ExpirationDate: expirationDateTimeString,
  }));

  const guaranteesWithOnlyGuaranteedLimitUpdated = facilityGuaranteesInAcbs.map((guaranteeInAcbs) => ({
    ...guaranteeInAcbs,
    GuaranteedLimit: guaranteedLimit,
  }));

  const guaranteesWithBothExpirationDateAndGuaranteedLimitUpdated = facilityGuaranteesInAcbs.map((guaranteeInAcbs) => ({
    ...guaranteeInAcbs,
    ExpirationDate: expirationDateTimeString,
    GuaranteedLimit: guaranteedLimit,
  }));

  const updatedGuarantees = guaranteesWithBothExpirationDateAndGuaranteedLimitUpdated;

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
      givenRequestToGetGuaranteesSucceeds();
      givenAllRequestsToReplaceGuaranteesSucceed();
    },
    makeRequest: () => api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetGuaranteesSucceeds();
      givenAllRequestsToReplaceGuaranteesSucceed();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.patchWithoutAuth(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the facility identifier if getting the facility guarantees succeeds and the facility covenants have all been successfully updated in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetGuaranteesSucceeds();
    const acbsRequests = givenAllRequestsToReplaceGuaranteesSucceed();

    const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    acbsRequests.forEach((request) => {
      expect(request.isDone()).toBe(true);
    });
  });

  it('returns a 200 response if ACBS returns a 200 response with an empty array when getting the facility guarantees', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetGuaranteesForFacilityWithId(facilityIdentifier).reply(200, []);

    const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
  });

  describe('partial update requests', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetGuaranteesSucceeds();
    });

    it('only updates the GuaranteedLimit of the facility guarantees if guaranteedLimit is the only field in the request', async () => {
      const expectedAcbsUpdateRequests = guaranteesWithOnlyGuaranteedLimitUpdated.map((guarantee) =>
        givenRequestToReplaceGuaranteeSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, { guaranteedLimit });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });

    it('only updates the ExpirationDate of the facility guarantees if expirationDate is the only field in the request', async () => {
      const expectedAcbsUpdateRequests = guaranteesWithOnlyExpirationDateUpdated.map((guarantee) =>
        givenRequestToReplaceGuaranteeSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, { expirationDate: expirationDateOnlyString });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });

    it('updates both ExpirationDate and GuaranteedLimit of the facility guarantees if both expirationDate and guaranteedLimit are specified in the request', async () => {
      const expectedAcbsUpdateRequests = guaranteesWithBothExpirationDateAndGuaranteedLimitUpdated.map((guarantee) =>
        givenRequestToReplaceGuaranteeSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, { guaranteedLimit, expirationDate: expirationDateOnlyString });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });
  });

  describe('error cases when getting the facility guarantees', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAllRequestsToReplaceGuaranteesSucceed();
    });

    it('returns a 404 response if ACBS returns a 200 response with null as the response body when getting the facility guarantees', async () => {
      requestToGetGuaranteesForFacilityWithId(facilityIdentifier).reply(200, null);

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(404);
      expect(body).toStrictEqual({
        statusCode: 404,
        message: 'Not found',
      });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 200 when getting the facility guarantees', async () => {
      requestToGetGuaranteesForFacilityWithId(facilityIdentifier).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when getting the facility guarantees', async () => {
      requestToGetGuaranteesForFacilityWithId(facilityIdentifier).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityGuaranteesInAcbs);

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });
  });

  describe.each([
    {
      errorCaseDescription: 'replacing the first facility guarantee',
      indexesOfGuaranteesUpdatedWithoutError: [1, 2],
      indexOfGuaranteeUpdatedWithError: 0,
    },
    {
      errorCaseDescription: 'replacing a middle facility guarantee',
      indexesOfGuaranteesUpdatedWithoutError: [0, 2],
      indexOfGuaranteeUpdatedWithError: 1,
    },
    {
      errorCaseDescription: 'replacing the last facility guarantee',
      indexesOfGuaranteesUpdatedWithoutError: [0, 1],
      indexOfGuaranteeUpdatedWithError: 2,
    },
  ])('error cases when $errorCaseDescription', ({ indexesOfGuaranteesUpdatedWithoutError, indexOfGuaranteeUpdatedWithError }) => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetGuaranteesSucceeds();
      indexesOfGuaranteesUpdatedWithoutError.forEach((guaranteeIndex) =>
        givenRequestToReplaceGuaranteeSucceeds(facilityIdentifier, updatedGuarantees[guaranteeIndex]),
      );
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "The facility not found" when replacing the facility guarantee', async () => {
      requestToReplaceGuarantee(facilityIdentifier, updatedGuarantees[indexOfGuaranteeUpdatedWithError]).reply(
        400,
        'The facility not found or the user does not have access to it.',
      );

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceGuarantee(facilityIdentifier, updatedGuarantees[indexOfGuaranteeUpdatedWithError]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "The facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceGuarantee(facilityIdentifier, updatedGuarantees[indexOfGuaranteeUpdatedWithError]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceGuarantee(facilityIdentifier, updatedGuarantees[indexOfGuaranteeUpdatedWithError]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceGuarantee(facilityIdentifier, updatedGuarantees[indexOfGuaranteeUpdatedWithError]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.patch(updateFacilityGuaranteesUrl, requestBodyToUpdateFacilityGuarantees);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('request body validation', () => {
    const makeRequest = (body: string | object) => api.patch(updateFacilityGuaranteesUrl, body);
    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetGuaranteesSucceeds();
      updatedGuarantees.forEach(() => givenAnyRequestBodyToReplaceFacilityGuaranteeSucceeds());
    };

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'guaranteedLimit',
      required: false,
      validRequestBody: requestBodyToUpdateFacilityGuarantees,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'expirationDate',
      required: false,
      nullable: false,
      validRequestBody: requestBodyToUpdateFacilityGuarantees,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNonEmptyObjectRequestValidationApiTests({
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  withFacilityIdentifierUrlValidationApiTests({
    givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId) => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetGuaranteesSucceedsForFacilityWithId(facilityId);
      givenAllRequestsToReplaceGuaranteesSucceedForFacilityWithId(facilityId);
    },
    makeRequestWithFacilityId: (facilityId) => api.patch(getUpdateFacilityGuaranteeUrlForFacilityId(facilityId), requestBodyToUpdateFacilityGuarantees),
  });

  const givenRequestToGetGuaranteesSucceeds = () => givenRequestToGetGuaranteesSucceedsForFacilityWithId(facilityIdentifier);

  const givenRequestToGetGuaranteesSucceedsForFacilityWithId = (facilityId: string): nock.Scope => {
    return requestToGetGuaranteesForFacilityWithId(facilityId).reply(200, facilityGuaranteesInAcbs);
  };

  const requestToGetGuaranteesForFacilityWithId = (facilityId: string) =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/FacilityGuarantee`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenAllRequestsToReplaceGuaranteesSucceed = () => givenAllRequestsToReplaceGuaranteesSucceedForFacilityWithId(facilityIdentifier);

  const givenAllRequestsToReplaceGuaranteesSucceedForFacilityWithId = (facilityId: string): nock.Scope[] =>
    updatedGuarantees.map((updatedGuarantee) => givenRequestToReplaceGuaranteeSucceeds(facilityId, updatedGuarantee));

  const givenRequestToReplaceGuaranteeSucceeds = (facilityId: string, requestBody: AcbsGetFacilityGuaranteeDto): nock.Scope => {
    return requestToReplaceGuarantee(facilityId, requestBody).reply(200);
  };

  const requestToReplaceGuarantee = (facilityId: string, requestBody: AcbsGetFacilityGuaranteeDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/FacilityGuarantee`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToReplaceFacilityGuaranteeSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(200);
  };
});

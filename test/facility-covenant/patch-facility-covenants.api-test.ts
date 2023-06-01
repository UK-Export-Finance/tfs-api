import { PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityCovenantsResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-covenants-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonEmptyObjectRequestValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-empty-object-request-validation-api-tests';
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
  const numberOfCovenantsForFacility = 3;

  const getUpdateFacilityCovenantUrlForFacilityId = (facilityId: string) => `/api/v1/facilities/${facilityId}/covenants`;

  const updateFacilityCovenantUrl = getUpdateFacilityCovenantUrlForFacilityId(facilityIdentifier);

  const { facilityCovenantsInAcbs } = new GetFacilityCovenantGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: numberOfCovenantsForFacility,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const covenantsWithOnlyExpirationDateUpdated = facilityCovenantsInAcbs.map((covenantInAcbs) => ({
    ...covenantInAcbs,
    ExpirationDate: expirationDateTimeString,
  }));

  const covenantsWithOnlyTargetAmountUpdated = facilityCovenantsInAcbs.map((covenantInAcbs) => ({
    ...covenantInAcbs,
    TargetAmount: targetAmount,
  }));

  const covenantsWithBothExpirationDateAndTargetAmountUpdated = facilityCovenantsInAcbs.map((covenantInAcbs) => ({
    ...covenantInAcbs,
    ExpirationDate: expirationDateTimeString,
    TargetAmount: targetAmount,
  }));

  const updatedCovenants = covenantsWithBothExpirationDateAndTargetAmountUpdated;

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

  it('returns a 200 response with the facility identifier if getting the facility covenants succeeds and the facility covenants have all been successfully updated in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetCovenantsSucceeds();
    const acbsRequests = givenAllRequestsToReplaceCovenantsSucceed();

    const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    acbsRequests.forEach((request) => {
      expect(request.isDone()).toBe(true);
    });
  });

  it('returns a 200 response if ACBS returns a 200 response with an empty array when getting the facility covenants', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetCovenantsForFacilityWithId(facilityIdentifier).reply(200, []);

    const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

    expect(status).toBe(200);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
  });

  describe('partial update requests', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
    });

    it('only updates the TargetAmount of the facility covenants if targetAmount is the only field in the request', async () => {
      const expectedAcbsUpdateRequests = covenantsWithOnlyTargetAmountUpdated.map((guarantee) =>
        givenRequestToReplaceCovenantSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityCovenantUrl, { targetAmount });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });

    it('only updates the ExpirationDate of the facility covenants if expirationDate is the only field in the request', async () => {
      const expectedAcbsUpdateRequests = covenantsWithOnlyExpirationDateUpdated.map((guarantee) =>
        givenRequestToReplaceCovenantSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityCovenantUrl, { expirationDate: expirationDateOnlyString });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });

    it('updates both ExpirationDate and TargetAmount of the facility covenants if both expirationDate and targetAmount are specified in the request', async () => {
      const expectedAcbsUpdateRequests = covenantsWithBothExpirationDateAndTargetAmountUpdated.map((guarantee) =>
        givenRequestToReplaceCovenantSucceeds(facilityIdentifier, guarantee),
      );

      const { status, body } = await api.patch(updateFacilityCovenantUrl, { targetAmount, expirationDate: expirationDateOnlyString });

      expect(status).toBe(200);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expectedAcbsUpdateRequests.forEach((request) => {
        expect(request.isDone()).toBe(true);
      });
    });
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

    it('returns a 500 response if ACBS times out when getting the facility covenants', async () => {
      requestToGetCovenantsForFacilityWithId(facilityIdentifier).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityCovenantsInAcbs);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });
  });

  describe.each([
    {
      errorCaseDescription: 'replacing the first facility covenant',
      indexesOfCovenantsUpdatedWithoutError: [1, 2],
      indexOfCovenantUpdatedWithError: 0,
    },
    {
      errorCaseDescription: 'replacing a middle facility covenant',
      indexesOfCovenantsUpdatedWithoutError: [0, 2],
      indexOfCovenantUpdatedWithError: 1,
    },
    {
      errorCaseDescription: 'replacing the last facility covenant',
      indexesOfCovenantsUpdatedWithoutError: [0, 1],
      indexOfCovenantUpdatedWithError: 2,
    },
  ])('error cases when $errorCaseDescription', ({ indexesOfCovenantsUpdatedWithoutError, indexOfCovenantUpdatedWithError }) => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      indexesOfCovenantsUpdatedWithoutError.forEach((covenantIndex) =>
        givenRequestToReplaceCovenantSucceeds(facilityIdentifier, updatedCovenants[covenantIndex]),
      );
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[indexOfCovenantUpdatedWithError]).reply(
        400,
        'Facility not found or the user does not have access to it',
      );

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when replacing the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[indexOfCovenantUpdatedWithError]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when replacing the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[indexOfCovenantUpdatedWithError]).reply(400, acbsErrorMessage);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when replacing the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[indexOfCovenantUpdatedWithError]).reply(401, 'Unauthorized');

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToReplaceCovenant(facilityIdentifier, updatedCovenants[indexOfCovenantUpdatedWithError]).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.patch(updateFacilityCovenantUrl, requestBodyToUpdateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('request body validation', () => {
    const makeRequest = (body: string | object) => api.patch(updateFacilityCovenantUrl, body);
    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetCovenantsSucceeds();
      updatedCovenants.forEach(() => givenAnyRequestBodyToReplaceCovenantsSucceeds());
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

    withNonEmptyObjectRequestValidationApiTests({
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
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

  const givenAllRequestsToReplaceCovenantsSucceedForFacilityWithId = (facilityId: string): nock.Scope[] =>
    updatedCovenants.map((updatedCovenant) => givenRequestToReplaceCovenantSucceeds(facilityId, updatedCovenant));

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

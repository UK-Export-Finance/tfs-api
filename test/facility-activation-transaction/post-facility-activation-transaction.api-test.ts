import { ENUMS, PROPERTIES } from '@ukef/constants';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityActivationTransactionGenerator } from '@ukef-test/support/generator/create-facility-activation-transaction-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/activation-transactions', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const createFacilityActivationTransactionUrl = `/api/v1/facilities/${facilityIdentifier}/activation-transactions`;
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const { facilitiesInAcbs } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
  });
  const effectiveDate = dateStringTransformations.removeTime(facilitiesInAcbs[0].OriginalEffectiveDate);
  const borrowerPartyIdentifier = facilitiesInAcbs[0].BorrowerParty.PartyIdentifier;
  const facilityInAcbs: AcbsGetFacilityResponseDto = facilitiesInAcbs[0];

  const {
    acbsRequestBodyToCreateFacilityActivationTransaction,
    requestBodyToCreateFacilityActivationTransaction,
    createFacilityActivationTransactionResponseFromService,
  } = new CreateFacilityActivationTransactionGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    bundleIdentifier,
    borrowerPartyIdentifier,
    effectiveDate,
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
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();
    },
    makeRequest: () => api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(
        createFacilityActivationTransactionUrl,
        requestBodyToCreateFacilityActivationTransaction,
        incorrectAuth?.headerName,
        incorrectAuth?.headerValue,
      ),
  });

  it('returns a 201 response with the bundle identifier if getting the facility succeeds and the facility activation transaction has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityFromAcbsSucceeds();
    const acbsRequest = givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();

    const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

    expect(status).toBe(201);
    expect(body).toStrictEqual(createFacilityActivationTransactionResponseFromService);
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when getting the facility', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when getting the facility', async () => {
      requestToGetFacility().reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is not a string when getting the facility', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when getting the facility', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when getting the facility', async () => {
      requestToGetFacility().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when getting the facility', async () => {
      requestToGetFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityInAcbs);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when creating the facility activation transaction', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when creating the facility activation transaction', async () => {
      requestToCreateFacilityActivationTransaction().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility activation transaction', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateFacilityActivationTransaction().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when creating the facility activation transaction', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateFacilityActivationTransaction().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility activation transaction', async () => {
      requestToCreateFacilityActivationTransaction().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility activation transaction', async () => {
      requestToCreateFacilityActivationTransaction().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(createFacilityActivationTransactionUrl, body);
    const possibleLenderTypeCode = Object.values(ENUMS.LENDER_TYPE_CODES);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenAnyRequestBodyToCreateFacilityActivationTransactionInAcbsSucceeds();
    };

    withFacilityIdentifierFieldValidationApiTests({
      valueGenerator,
      validRequestBody: requestBodyToCreateFacilityActivationTransaction,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'lenderTypeCode',
      enum: ENUMS.LENDER_TYPE_CODES,
      length: 3,
      generateFieldValueOfLength: (length: number) =>
        length === 3 ? possibleLenderTypeCode[valueGenerator.integer({ min: 0, max: possibleLenderTypeCode.length - 1 })] : valueGenerator.string({ length }),
      generateFieldValueThatDoesNotMatchEnum: () => '123',
      validRequestBody: requestBodyToCreateFacilityActivationTransaction,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    // TODO: Add Enum support to Numeric field validation, add Enum check for initialBundleStatusCode, enable code bellow.
    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'initialBundleStatusCode',
      enum: ENUMS.BUNDLE_STATUSES,
      generateFieldValueThatDoesNotMatchEnum: () => 5,
      validRequestBody: requestBodyToCreateFacilityActivationTransaction,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  const givenRequestToGetFacilityFromAcbsSucceeds = (): nock.Scope => givenRequestToGetFacilityFromAcbsSucceedsReturning(facilityInAcbs);

  const givenRequestToGetFacilityFromAcbsSucceedsReturning = (acbsFacility: AcbsGetFacilityResponseDto): nock.Scope => {
    return requestToGetFacility().reply(200, acbsFacility);
  };

  const requestToGetFacility = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityActivationTransaction().reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };

  const requestToCreateFacilityActivationTransaction = (): nock.Interceptor =>
    requestToCreateFacilityActivationTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsRequestBodyToCreateFacilityActivationTransaction)));

  const requestToCreateFacilityActivationTransactionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreateFacilityActivationTransactionInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };
});

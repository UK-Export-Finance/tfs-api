import { PROPERTIES } from '@ukef/constants';
import { AcbsCreateFacilityCovenantRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-covenant-request.dto';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCovenantIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/covenant-identifier-field-validation-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-field-validation-api-tests';
import { withRequiredNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/required-non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityCovenantGenerator } from '@ukef-test/support/generator/create-facility-covenant-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/covenants', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const createFacilityCovenantUrl = `/api/v1/facilities/${facilityIdentifier}/covenants`;
  const facilityTypeCode = valueGenerator.stringOfNumericCharacters();
  const limitKeyValue = valueGenerator.string();

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const { facilitiesInAcbs } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
  });
  const facilityInAcbs: AcbsGetFacilityResponseDto = {
    ...facilitiesInAcbs[0],
    FacilityType: { FacilityTypeCode: facilityTypeCode },
    BorrowerParty: { PartyIdentifier: limitKeyValue, PartyName1: valueGenerator.string() },
  };

  const { acbsRequestBodyToCreateFacilityCovenant, requestBodyToCreateFacilityCovenant } = new CreateFacilityCovenantGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 2,
    facilityIdentifier,
    facilityTypeCode,
    limitKeyValue,
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
      givenRequestToCreateFacilityCovenantInAcbsSucceeds();
    },
    makeRequest: () => api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenRequestToCreateFacilityCovenantInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the facility identifier if getting the facility succeeds and the facility covenant has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityFromAcbsSucceeds();
    const acbsRequest = givenRequestToCreateFacilityCovenantInAcbsSucceeds();

    const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier, // TODO APIM-106: is this the correct response?
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when getting the facility', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityCovenantInAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when getting the facility', async () => {
      requestToGetFacility().reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is not a string when getting the facility', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when getting the facility', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when getting the facility', async () => {
      requestToGetFacility().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when getting the facility', async () => {
      requestToGetFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityInAcbs);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when creating the facility covenant', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when creating the facility covenant', async () => {
      requestToCreateFacilityCovenant().reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility covenant', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateFacilityCovenant().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when creating the facility covenant', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateFacilityCovenant().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility covenant', async () => {
      requestToCreateFacilityCovenant().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility covenant', async () => {
      requestToCreateFacilityCovenant().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createFacilityCovenantUrl, requestBodyToCreateFacilityCovenant);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  const makeRequest = (body: unknown[]) => api.post(createFacilityCovenantUrl, body);
  const givenAnyRequestBodyWouldSucceed = () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityFromAcbsSucceeds();
    givenAnyRequestBodyToCreateFacilityCovenantInAcbsSucceeds();
  };

  withFacilityIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withCovenantIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'covenantType',
    length: 2,
    generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withRequiredNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateFacilityCovenant,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  const givenRequestToGetFacilityFromAcbsSucceeds = (): nock.Scope => {
    return requestToGetFacility().reply(200, facilityInAcbs);
  };

  // TODO APIM-106: remove duplication
  const requestToGetFacility = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreateFacilityCovenantInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityCovenant().reply(201);
  };

  const requestToCreateFacilityCovenant = (): nock.Interceptor => requestToCreateFacilityCovenantInAcbsWithBody(acbsRequestBodyToCreateFacilityCovenant);

  const requestToCreateFacilityCovenantInAcbsWithBody = (requestBody: AcbsCreateFacilityCovenantRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreateFacilityCovenantInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Covenant`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201);
  };
});

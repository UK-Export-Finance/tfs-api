import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withDealIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/deal-identifier-field-validation-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/party-identifier-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityGenerator } from '@ukef-test/support/generator/create-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';
import supertest from 'supertest';

describe('POST /facilities', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
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

  withDealIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withFacilityIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withPartyIdentifierFieldValidationApiTests({
    fieldName: 'dealBorrowerIdentifier',
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'productTypeId',
    minLength: 0,
    maxLength: 3,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'productTypeName',
    minLength: 0,
    maxLength: 13,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'exposurePeriod',
    minLength: 0,
    maxLength: 12,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'obligorIndustryClassification',
    minLength: 0,
    maxLength: 10,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'nextQuarterEndDate',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withPartyIdentifierFieldValidationApiTests({
    fieldName: 'agentBankIdentifier',
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'riskCountryCode',
    minLength: 0,
    maxLength: 3,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'premiumFrequencyCode',
    minLength: 0,
    maxLength: 1,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'riskStatusCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'creditRatingCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'facilityStageCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'delegationType',
    minLength: 0,
    maxLength: 4,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'interestOrFeeRate',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withPartyIdentifierFieldValidationApiTests({
    fieldName: 'obligorPartyIdentifier',
    valueGenerator,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'foreCastPercentage',
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'probabilityOfDefault',
    required: false,
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'capitalConversionFactorCode',
    minLength: 0,
    maxLength: 2,
    required: false,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody: requestBodyToCreateFacility,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'issueDate',
    required: false,
    nullable: true,
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

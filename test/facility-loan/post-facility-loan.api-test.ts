import { ENUMS, PROPERTIES } from '@ukef/constants';
import { ProductTypeGroupEnum } from '@ukef/constants/enums/product-type-group';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withEnumFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/enum-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/party-identifier-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityLoanGenerator } from '@ukef-test/support/generator/create-facility-loan-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/loans', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const postFacilityLoanUrl = `/api/v1/facilities/${facilityIdentifier}/loans`;
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;

  const { acbsRequestBodyToCreateFacilityLoanGbp, requestBodyToCreateFacilityLoanGbp, createFacilityLoanResponseFromService } = new CreateFacilityLoanGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    bundleIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateFacilityLoanInAcbsSucceeds(),
    makeRequest: () => api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityLoanInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the bundle identifier if the facility loan has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateFacilityLoanInAcbsSucceeds();

    const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

    expect(status).toBe(201);
    expect(body).toStrictEqual(createFacilityLoanResponseFromService);
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('error cases when creating the facility loan', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility does not exist" when creating the facility loan', async () => {
      requestToCreateFacilityLoan().reply(400, `Facility does not exist or user does not have access to it: '${facilityIdentifier}'`);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility loan', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateFacilityLoan().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Facility does not exist" when creating the facility loan', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateFacilityLoan().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility loan', async () => {
      requestToCreateFacilityLoan().reply(401, 'Unauthorized');

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility loan', async () => {
      requestToCreateFacilityLoan().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(postFacilityLoanUrl, requestBodyToCreateFacilityLoanGbp);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(postFacilityLoanUrl, body);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityLoanInAcbsSucceeds();
    };

    withDateOnlyFieldValidationApiTests({
      fieldName: 'postingDate',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withPartyIdentifierFieldValidationApiTests({
      fieldName: 'borrowerPartyIdentifier',
      valueGenerator,
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withEnumFieldValidationApiTests({
      fieldName: 'productTypeId',
      enum: ENUMS.PRODUCT_TYPE_IDS,
      length: 3,
      generateFieldValueOfLength: (length: number) => (length === 3 ? valueGenerator.enumValue(ENUMS.PRODUCT_TYPE_IDS) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => '123',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withEnumFieldValidationApiTests({
      fieldName: 'productTypeGroup',
      enum: ENUMS.PRODUCT_TYPE_GROUPS,
      length: 2,
      generateFieldValueOfLength: (length: number) => (length === 2 ? valueGenerator.enumValue(ENUMS.PRODUCT_TYPE_GROUPS) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => '12',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withCurrencyFieldValidationApiTests({
      valueGenerator,
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNumberFieldValidationApiTests({
      fieldName: 'dealCustomerUsageRate',
      required: false,
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withEnumFieldValidationApiTests({
      fieldName: 'dealCustomerUsageOperationType',
      required: false,
      enum: ENUMS.OPERATION_TYPE_CODES,
      length: 1,
      generateFieldValueOfLength: (length: number) => (length === 1 ? valueGenerator.enumValue(ENUMS.OPERATION_TYPE_CODES) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => '3',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'amount',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'issueDate',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'expiryDate',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'nextDueDate',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withEnumFieldValidationApiTests({
      fieldName: 'loanBillingFrequencyType',
      length: 1,
      required: true,
      enum: ENUMS.FEE_FREQUENCY_TYPES,
      generateFieldValueOfLength: (length: number) => (length === 1 ? valueGenerator.enumValue(ENUMS.FEE_FREQUENCY_TYPES) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => '3',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'spreadRate',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'spreadRateCtl',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
      required: false,
    });

    withEnumFieldValidationApiTests({
      fieldName: 'yearBasis',
      length: 1,
      required: true,
      enum: ENUMS.YEAR_BASIS_CODES,
      generateFieldValueOfLength: (length: number) => (length === 1 ? valueGenerator.enumValue(ENUMS.YEAR_BASIS_CODES) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => 'A',
      validRequestBody: requestBodyToCreateFacilityLoanGbp,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    const indexRateChangeFrequencyValidationTestOptions = {
      fieldName: 'indexRateChangeFrequency',
      length: 1,
      enum: ENUMS.FEE_FREQUENCY_TYPES,
      generateFieldValueOfLength: (length: number) => (length === 1 ? valueGenerator.enumValue(ENUMS.FEE_FREQUENCY_TYPES) : valueGenerator.string({ length })),
      generateFieldValueThatDoesNotMatchEnum: () => '3',
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    } as const;

    describe(`for a ${ProductTypeGroupEnum.EWCS} loan`, () => {
      const requestBodyToCreateEwcsFacilityLoan = [
        {
          ...requestBodyToCreateFacilityLoanGbp[0],
          productTypeGroup: ProductTypeGroupEnum.EWCS,
        },
      ];

      withEnumFieldValidationApiTests({
        ...indexRateChangeFrequencyValidationTestOptions,
        required: true,
        validRequestBody: requestBodyToCreateEwcsFacilityLoan,
      });
    });

    const nonEwcsProductTypeGroups = Object.values(ProductTypeGroupEnum)
      .filter((group) => group !== ProductTypeGroupEnum.EWCS)
      .map((group) => ({ productTypeGroup: group }));
    describe.each(nonEwcsProductTypeGroups)('for a $productTypeGroup loan', ({ productTypeGroup }) => {
      const requestBodyToCreateFacilityLoanWithProductTypeGroup = [
        {
          ...requestBodyToCreateFacilityLoanGbp[0],
          productTypeGroup,
        },
      ];

      withEnumFieldValidationApiTests({
        ...indexRateChangeFrequencyValidationTestOptions,
        required: false,
        validRequestBody: requestBodyToCreateFacilityLoanWithProductTypeGroup,
      });
    });
  });

  const givenRequestToCreateFacilityLoanInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityLoan().reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };

  const requestToCreateFacilityLoan = (): nock.Interceptor =>
    requestToCreateFacilityLoanInAcbsWithBody(JSON.parse(JSON.stringify(acbsRequestBodyToCreateFacilityLoanGbp)));

  const requestToCreateFacilityLoanInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreateFacilityLoanInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, { bundleidentifier: bundleIdentifier });
  };
});

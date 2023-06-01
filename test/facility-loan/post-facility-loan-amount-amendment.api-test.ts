import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { withAcbsCreateBundleInformationTests } from '@ukef-test/common-tests/acbs-create-bundle-information-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { withLoanIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/loan-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateFacilityLoanAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-loan-amount-amendment.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/loans/{loanIdentifier}/amendments/amount', () => {
  const valueGenerator = new RandomValueGenerator();
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();
  const createdBundleIdentifier = valueGenerator.acbsBundleId();
  const acbsSuccessfulResponse: [number, undefined, { BundleIdentifier: string }] = [201, undefined, { BundleIdentifier: createdBundleIdentifier }];
  const { increaseAmountRequest, decreaseAmountRequest, acbsLoanAmendmentForIncrease, acbsLoanAmendmentForDecrease } =
    new CreateFacilityLoanAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({ loanIdentifier, numberToGenerate: 1 });

  const createLoanAmountAmendmentUrl = (
    { facilityId, loanId }: { facilityId: string; loanId: string } = { facilityId: facilityIdentifier, loanId: loanIdentifier },
  ) => `/api/v1/facilities/${facilityId}/loans/${loanId}/amendments/amount`;

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
    givenRequestWouldOtherwiseSucceed: () => requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse),
    makeRequest: () => api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToCreateIncreaseLoanAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createLoanAmountAmendmentUrl(), increaseAmountRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('with a increasing loan amount', () => {
    withAcbsCreateBundleInformationTests({
      givenTheRequestWouldOtherwiseSucceed: () => givenAuthenticationWithTheIdpSucceeds(),
      requestToCreateBundleInformationInAcbs: () => requestToCreateIncreaseLoanAdvanceTransactionInAcbs(),
      givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds(),
      makeRequest: () => api.post(createLoanAmountAmendmentUrl(), increaseAmountRequest),
      facilityIdentifier,
      expectedResponse: { bundleIdentifier: createdBundleIdentifier },
      createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.LOAN_ADVANCE_TRANSACTION,
      expectedResponseCode: 201,
    });
  });

  describe('with a decreasing loan amount', () => {
    withAcbsCreateBundleInformationTests({
      givenTheRequestWouldOtherwiseSucceed: () => givenAuthenticationWithTheIdpSucceeds(),
      requestToCreateBundleInformationInAcbs: () => requestToCreateDecreaseLoanAdvanceTransactionInAcbs(),
      givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds(),
      makeRequest: () => api.post(createLoanAmountAmendmentUrl(), decreaseAmountRequest),
      facilityIdentifier,
      expectedResponse: { bundleIdentifier: createdBundleIdentifier },
      createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.LOAN_ADVANCE_TRANSACTION,
      expectedResponseCode: 201,
    });
  });

  describe('field validation', () => {
    withDateOnlyFieldValidationApiTests({
      fieldName: 'effectiveDate',
      validRequestBody: increaseAmountRequest,
      makeRequest: (body) => api.post(createLoanAmountAmendmentUrl(), body),
      givenAnyRequestBodyWouldSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
    });

    withNumberFieldValidationApiTests({
      fieldName: 'amountAmendment',
      validRequestBody: increaseAmountRequest,
      makeRequest: (body) => api.post(createLoanAmountAmendmentUrl(), body),
      givenAnyRequestBodyWouldSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      forbidZero: true,
    });
  });

  describe('URL parameter validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      makeRequestWithFacilityId: (facilityId: string) => api.post(createLoanAmountAmendmentUrl({ facilityId, loanId: loanIdentifier }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      successStatusCode: 201,
    });

    withLoanIdentifierUrlValidationApiTests({
      makeRequestWithLoanId: (loanId: string) => api.post(createLoanAmountAmendmentUrl({ loanId, facilityId: facilityIdentifier }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForLoanId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds();
      },
      successStatusCode: 201,
    });
  });

  const requestToCreateIncreaseLoanAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateLoanAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsLoanAmendmentForIncrease)));

  const requestToCreateDecreaseLoanAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateLoanAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsLoanAmendmentForDecrease)));

  const givenAnyRequestBodyToCreateLoanAmountAmendmentInAcbsSucceeds = (): nock.Scope => {
    const requestBodyPlaceholder = '*';
    return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json')
      .reply(...acbsSuccessfulResponse);
  };

  const requestToCreateLoanAdvanceTransactionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');
});

import { ENUMS, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsPartyId } from '@ukef/helpers';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { withAcbsCreateBundleInformationTests } from '@ukef-test/common-tests/acbs-create-bundle-information-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/party-identifier-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateFacilityFixedFeesAmountAmendmentGenerator } from '@ukef-test/support/generator/create-facility-fixed-fees-amount-amendment.generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/fixed-fees/amendments/amount', () => {
  const valueGenerator = new RandomValueGenerator();
  const { servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const createdBundleIdentifier = valueGenerator.acbsBundleId();
  const errorString = valueGenerator.string();
  const acbsSuccessfulResponse: [number, undefined, { BundleIdentifier: string }] = [201, undefined, { BundleIdentifier: createdBundleIdentifier }];
  const acbsSuccessfulResponseWithWarningHeader: [number, undefined, { BundleIdentifier: string; 'processing-warning': string }] = [
    201,
    undefined,
    { BundleIdentifier: createdBundleIdentifier, 'processing-warning': errorString },
  ];
  const { increaseAmountRequest, decreaseAmountRequest, acbsFixedFeesAmendmentForIncrease, acbsFixedFeesAmendmentForDecrease } =
    new CreateFacilityFixedFeesAmountAmendmentGenerator(valueGenerator, new DateStringTransformations()).generate({ numberToGenerate: 3, facilityIdentifier });

  const createFixedFeesAmountAmendmentUrl = ({ facilityId }: { facilityId: string } = { facilityId: facilityIdentifier }) =>
    `/api/v1/facilities/${facilityId}/fixed-fees/amendments/amount`;

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
    givenRequestWouldOtherwiseSucceed: () => requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse),
    makeRequest: () => api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs().reply(...acbsSuccessfulResponse);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('with an increase fixed fees amount amendment', () => {
    withAcbsCreateBundleInformationTests({
      givenTheRequestWouldOtherwiseSucceed: () => givenAuthenticationWithTheIdpSucceeds(),
      requestToCreateBundleInformationInAcbs: () => requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs(),
      givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponse),
      givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader: () =>
        givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponseWithWarningHeader),
      makeRequest: () => api.post(createFixedFeesAmountAmendmentUrl(), increaseAmountRequest),
      facilityIdentifier,
      expectedResponse: { bundleIdentifier: createdBundleIdentifier },
      createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_FEE_AMOUNT_TRANSACTION,
      expectedResponseCode: 201,
      errorString,
    });
  });

  describe('with a decrease fixed fees amount amendment', () => {
    withAcbsCreateBundleInformationTests({
      givenTheRequestWouldOtherwiseSucceed: () => givenAuthenticationWithTheIdpSucceeds(),
      requestToCreateBundleInformationInAcbs: () => requestToCreateDecreaseFixedFeesAdvanceTransactionInAcbs(),
      givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponse),
      givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader: () =>
        givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponseWithWarningHeader),
      makeRequest: () => api.post(createFixedFeesAmountAmendmentUrl(), decreaseAmountRequest),
      facilityIdentifier,
      expectedResponse: { bundleIdentifier: createdBundleIdentifier },
      createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_FEE_AMOUNT_TRANSACTION,
      expectedResponseCode: 201,
      errorString,
    });
  });

  describe('field validation', () => {
    const makeRequest = (body) => api.post(createFixedFeesAmountAmendmentUrl(), body);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponse);
    };

    withPartyIdentifierFieldValidationApiTests({
      fieldName: 'partyIdentifier',
      valueGenerator,
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'partyIdentifier',
      length: 8,
      required: true,
      generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }) as AcbsPartyId,
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'period',
      length: 2,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'lenderTypeCode',
      enum: ENUMS.LENDER_TYPE_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => '123' as LenderTypeCodeEnum,
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'effectiveDate',
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNumberFieldValidationApiTests({
      fieldName: 'amountAmendment',
      validRequestBody: increaseAmountRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
      forbidZero: true,
    });
  });

  describe('URL parameter validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      makeRequestWithFacilityId: (facilityId: string) => api.post(createFixedFeesAmountAmendmentUrl({ facilityId }), increaseAmountRequest),
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds(acbsSuccessfulResponse);
      },
      successStatusCode: 201,
    });
  });

  const requestToCreateIncreaseFixedFeesAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsFixedFeesAmendmentForIncrease)));

  const requestToCreateDecreaseFixedFeesAdvanceTransactionInAcbs = (): nock.Interceptor =>
    requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody(JSON.parse(JSON.stringify(acbsFixedFeesAmendmentForDecrease)));

  const givenAnyRequestBodyToCreateFixedFeesAmountAmendmentInAcbsSucceeds = (
    acbsSuccessfulResponse: [number, undefined, { BundleIdentifier: string }],
  ): nock.Scope => {
    const requestBodyPlaceholder = '*';
    return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json')
      .reply(...acbsSuccessfulResponse);
  };

  const requestToCreateFixedFeesAdvanceTransactionInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');
});

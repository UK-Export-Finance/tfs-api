import { ENUMS, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { withAcbsCreateBundleInformationTests } from '@ukef-test/common-tests/acbs-create-bundle-information-api-tests';
import { withAcbsGetFacilityServiceCommonTests } from '@ukef-test/common-tests/acbs-get-facility-by-identifier-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
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
  const [facilityInAcbs]: AcbsGetFacilityResponseDto[] = facilitiesInAcbs;

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
      givenRequestToGetFacilityInAcbsSucceeds();
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();
    },
    makeRequest: () => api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityInAcbsSucceeds();
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

  withAcbsCreateBundleInformationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetFacilityInAcbsSucceeds();
      givenAuthenticationWithTheIdpSucceeds();
    },
    requestToCreateBundleInformationInAcbs: () => requestToCreateFacilityActivationTransactionInAcbs(),
    givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds(),
    givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader: () =>
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceedsWithWarningHeader(),
    makeRequest: () => api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction),
    facilityIdentifier,
    expectedResponse: createFacilityActivationTransactionResponseFromService,
    expectedResponseCode: 201,
    createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_CODE_VALUE_TRANSACTION,
  });

  withAcbsGetFacilityServiceCommonTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds();
    },
    requestToGetFacilityInAcbs: () => requestToGetFacilityInAcbs(),
    makeRequest: () => api.post(createFacilityActivationTransactionUrl, requestBodyToCreateFacilityActivationTransaction),
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(createFacilityActivationTransactionUrl, body);

    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityInAcbsSucceeds();
      givenAnyRequestBodyToCreateFacilityActivationTransactionInAcbsSucceeds();
    };

    withStringFieldValidationApiTests({
      fieldName: 'lenderTypeCode',
      enum: ENUMS.LENDER_TYPE_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => '123' as LenderTypeCodeEnum,
      validRequestBody: requestBodyToCreateFacilityActivationTransaction,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withNumberFieldValidationApiTests({
      fieldName: 'initialBundleStatusCode',
      enum: ENUMS.INITIAL_BUNDLE_STATUS_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => 5,
      validRequestBody: requestBodyToCreateFacilityActivationTransaction,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  const givenRequestToGetFacilityInAcbsSucceeds = (): nock.Scope => givenRequestToGetFacilityInAcbsSucceedsReturning(facilityInAcbs);

  const givenRequestToGetFacilityInAcbsSucceedsReturning = (acbsFacility: AcbsGetFacilityResponseDto): nock.Scope => {
    return requestToGetFacilityInAcbs().reply(200, acbsFacility);
  };

  const requestToGetFacilityInAcbs = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreateFacilityActivationTransactionInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityActivationTransactionInAcbs().reply(201, undefined, { bundleIdentifier, 'processing-warning': '' });
  };

  const givenRequestToCreateFacilityActivationTransactionInAcbsSucceedsWithWarningHeader = (): nock.Scope => {
    return requestToCreateFacilityActivationTransactionInAcbs().reply(201, undefined, { bundleIdentifier, 'processing-warning': 'error' });
  };

  const requestToCreateFacilityActivationTransactionInAcbs = (): nock.Interceptor =>
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

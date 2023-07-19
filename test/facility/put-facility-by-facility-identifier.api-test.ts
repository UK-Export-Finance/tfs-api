import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { withAcbsCreateBundleInformationTests } from '@ukef-test/common-tests/acbs-create-bundle-information-api-tests';
import { withAcbsGetFacilityServiceCommonTests } from '@ukef-test/common-tests/acbs-get-facility-by-identifier-api-tests';
import { withAcbsUpdateFacilityByIdentifierServiceTests } from '@ukef-test/common-tests/acbs-update-facility-by-identifier-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBaseFacilityFieldsValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/base-facility-fields-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withIssueFacilityTests } from '@ukef-test/facility/put-facility-by-facility-identifier.test-parts/issue-facility-api-tests';
import { withPutFacilityQueryParameterTests } from '@ukef-test/facility/put-facility-by-facility-identifier.test-parts/put-facility-by-facility-query-parameter-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import { PutFacilityAcbsRequests } from '@ukef-test/support/interfaces/put-facility-by-facility-identifier-acbs-endpoints.interface.';
import nock from 'nock';
import supertest from 'supertest';

describe('PUT /facilities', () => {
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

  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier, servicingQueueIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();

  const updateFacilityBaseUrl = `/api/v1/facilities/${facilityIdentifier}`;

  const {
    updateFacilityRequest,
    acbsGetExistingFacilityResponse,
    acbsUpdateFacilityRequest: expectedAcbsUpdateFacilityRequest,
    acbsBundleInformationRequest: expectedAcbsBundleInformationRequest,
  } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1, facilityIdentifier });

  withPutFacilityQueryParameterTests({
    makeRequestWithUrl: (url) => makeRequestWithUrl(url),
    updateFacilityBaseUrl,
  });

  describe.each([
    { queryToTest: ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE },
    { queryToTest: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE },
    { queryToTest: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT },
  ])('PUT /facilities?op=$queryToTest', ({ queryToTest }) => {
    const updateFacilityUrl = updateFacilityBaseUrl + `?op=${queryToTest}`;

    const bundleIdentifier = valueGenerator.acbsBundleId();

    const expectedPutResponse = queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT ? { bundleIdentifier } : { facilityIdentifier };

    // We have an exception thrown on the ISSUE endpoint if issue date is null or undefined.
    // We therefore run these checks seperately
    const includeIssueDateInFieldValidation = queryToTest !== ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE;

    const { idToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
      givenRequestWouldOtherwiseSucceed: () => {
        givenRequestToGetFacilityInAcbsSucceeds();
        givenRequestToUpdateInAcbsSucceeds();
      },
      makeRequest: () => makeRequest(),
    });

    it('returns a 200 response with the expected response if the facility has been successfully updated in ACBS', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsGetRequest = givenRequestToGetFacilityInAcbsSucceeds();
      const acbsUpdateRequest = givenRequestToUpdateInAcbsSucceeds();

      const { status, body } = await makeRequest();

      expect(status).toBe(200);
      expect(body).toStrictEqual(expectedPutResponse);

      expect(acbsGetRequest.isDone()).toBe(true);
      expect(acbsUpdateRequest.isDone()).toBe(true);
    });

    withClientAuthenticationTests({
      givenTheRequestWouldOtherwiseSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetFacilityInAcbsSucceeds();
        givenRequestToUpdateInAcbsSucceeds();
      },
      makeRequestWithoutAuth: () => makeRequestWithoutAuth(),
    });

    withBaseFacilityFieldsValidationApiTests({
      valueGenerator,
      validRequestBody: updateFacilityRequest,
      makeRequest: (body: unknown) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      includeIssueDate: includeIssueDateInFieldValidation,
    });

    withAcbsGetFacilityServiceCommonTests({
      givenTheRequestWouldOtherwiseSucceed: () => {
        givenRequestToUpdateInAcbsSucceeds();
        givenAuthenticationWithTheIdpSucceeds();
      },
      requestToGetFacilityInAcbs: () => requestToGetFacilityInAcbs(),
      makeRequest: () => makeRequest(),
    });

    if (queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE) {
      withIssueFacilityTests({
        givenTheRequestWouldOtherwiseSucceed: () => {
          givenAuthenticationWithTheIdpSucceeds();
          givenRequestToGetFacilityInAcbsSucceeds();
        },
        updateFacilityRequest,
        makeRequestWithBody: (body: unknown) => makeRequestWithBody(body),
      });

      withDateOnlyFieldValidationApiTests({
        fieldName: 'issueDate',
        required: true,
        nullable: false,
        validRequestBody: updateFacilityRequest,
        makeRequest: (body: unknown) => makeRequestWithBody(body),
        givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      });
    }

    if (queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE || queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE) {
      withAcbsUpdateFacilityByIdentifierServiceTests({
        givenTheRequestWouldOtherwiseSucceed: () => {
          givenRequestToGetFacilityInAcbsSucceeds();
          givenAuthenticationWithTheIdpSucceeds();
        },
        requestToUpdateFacilityInAcbs: () => requestToUpdateInAcbs(),
        makeRequest: () => makeRequest(),
      });
    }

    if (queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT) {
      withAcbsCreateBundleInformationTests({
        givenTheRequestWouldOtherwiseSucceed: () => {
          givenRequestToGetFacilityInAcbsSucceeds();
          givenAuthenticationWithTheIdpSucceeds();
        },
        requestToCreateBundleInformationInAcbs: () => requestToUpdateInAcbs(),
        givenRequestToCreateBundleInformationInAcbsSucceeds: () => givenRequestToUpdateInAcbsSucceeds(),
        givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader: () => givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader(),
        makeRequest: () => makeRequest(),
        facilityIdentifier,
        expectedResponse: expectedPutResponse,
        expectedResponseCode: 200,
        createBundleInformationType: ENUMS.BUNDLE_INFORMATION_TYPES.FACILITY_AMOUNT_TRANSACTION,
      });
    }

    const makeRequestWithBody = (body: unknown): supertest.Test => makeRequestWithUrlAndBody(updateFacilityUrl, body);

    const makeRequest = (): supertest.Test => makeRequestWithUrlAndBody(updateFacilityUrl, updateFacilityRequest);

    const makeRequestWithoutAuth = (incorrectAuth?: IncorrectAuthArg) =>
      api.putWithoutAuth(updateFacilityBaseUrl, updateFacilityRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue);

    const requestToGetFacilityInAcbs = () =>
      nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
        .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
        .matchHeader('authorization', `Bearer ${idToken}`);

    const givenRequestToGetFacilityInAcbsSucceeds = () => requestToGetFacilityInAcbs().reply(200, acbsGetExistingFacilityResponse);

    const getRequestToAcbsConfig = () => {
      const requestToUpdateFacilityInAcbs = () => {
        const requestToUpdateFacilityInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
          nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBody)
            .matchHeader('authorization', `Bearer ${idToken}`);

        return requestToUpdateFacilityInAcbsWithBody(JSON.parse(JSON.stringify(expectedAcbsUpdateFacilityRequest)));
      };

      const requestToCreateBundleInfomationInAcbs = () => {
        const requestToCreateBundleInfomationInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
          nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBody)
            .matchHeader('authorization', `Bearer ${idToken}`)
            .matchHeader('Content-Type', 'application/json');

        return requestToCreateBundleInfomationInAcbsWithBody(JSON.parse(JSON.stringify(expectedAcbsBundleInformationRequest)));
      };

      const requestToUpdateInAcbs = () => {
        return queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT ? requestToCreateBundleInfomationInAcbs() : requestToUpdateFacilityInAcbs();
      };

      const givenRequestToUpdateInAcbsSucceeds = () => {
        const givenRequestToUpdateFacilityInAcbsSucceeds = () =>
          requestToUpdateFacilityInAcbs().reply(200, undefined, {
            location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
          });

        const givenRequestToCreateBundleInfomationInAcbsSucceeds = () =>
          requestToCreateBundleInfomationInAcbs().reply(201, undefined, { bundleIdentifier, 'processing-warning': '' });

        return queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT
          ? givenRequestToCreateBundleInfomationInAcbsSucceeds()
          : givenRequestToUpdateFacilityInAcbsSucceeds();
      };

      const givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader = () =>
        requestToCreateBundleInfomationInAcbs().reply(201, undefined, { bundleIdentifier, 'processing-warning': 'error' });

      const givenAnyRequestBodyToUpdateInAcbsSucceeds = () => {
        const givenAnyRequestBodyToUpdateFacilityInAcbsSucceeds = (): nock.Scope => {
          const requestBodyPlaceholder = '*';
          return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .filteringRequestBody(() => requestBodyPlaceholder)
            .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBodyPlaceholder)
            .matchHeader('authorization', `Bearer ${idToken}`)
            .reply(200, undefined, {
              location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
            });
        };

        const givenAnyRequestBodyToCreateFacilityActivationTransactionInAcbsSucceeds = (): nock.Scope => {
          const requestBodyPlaceholder = '*';
          return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .filteringRequestBody(() => requestBodyPlaceholder)
            .post(`/BundleInformation?servicingQueueIdentifier=${servicingQueueIdentifier}`, requestBodyPlaceholder)
            .matchHeader('authorization', `Bearer ${idToken}`)
            .reply(201, undefined, { bundleIdentifier });
        };
        return queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_AMOUNT
          ? givenAnyRequestBodyToCreateFacilityActivationTransactionInAcbsSucceeds()
          : givenAnyRequestBodyToUpdateFacilityInAcbsSucceeds();
      };

      return {
        requestToUpdateInAcbs,
        givenRequestToUpdateInAcbsSucceeds,
        givenAnyRequestBodyToUpdateInAcbsSucceeds,
        givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader,
      };
    };

    const {
      requestToUpdateInAcbs,
      givenRequestToUpdateInAcbsSucceeds,
      givenAnyRequestBodyToUpdateInAcbsSucceeds,
      givenRequestToCreateBundleInformationInAcbsSucceedsWithWarningHeader,
    } = getRequestToAcbsConfig();

    const givenAnyRequestBodyWouldSucceed = (): PutFacilityAcbsRequests => {
      const givenAnyRequestToGetFacilityInAcbsSucceeds = (): nock.Scope => {
        const requestBodyPlaceholder = '*';
        return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
          .filteringRequestBody(() => requestBodyPlaceholder)
          .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBodyPlaceholder)
          .matchHeader('authorization', `Bearer ${idToken}`)
          .reply(200, acbsGetExistingFacilityResponse, { location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}` });
      };

      givenAuthenticationWithTheIdpSucceeds();

      return { acbsGetRequest: givenAnyRequestToGetFacilityInAcbsSucceeds(), acbsUpdateRequest: givenAnyRequestBodyToUpdateInAcbsSucceeds() };
    };
  });

  const makeRequestWithUrlAndBody = (url: string, body: unknown): supertest.Test => api.put(url, JSON.parse(JSON.stringify(body)));

  const makeRequestWithUrl = (url: string): supertest.Test => makeRequestWithUrlAndBody(url, updateFacilityRequest);
});

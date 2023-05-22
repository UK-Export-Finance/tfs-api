import { ENUMS, PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBaseFacilityFieldsValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/base-facility-fields-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_FACILITY_STAGE_CODE } from '@ukef-test/support/constants/test-issue-code.constant';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateFacilityGenerator } from '@ukef-test/support/generator/update-facility-generator';
import nock from 'nock';
import supertest from 'supertest';

import { withAcbsGetFacilityServiceCommonTests } from '../common-tests/acbs-get-facility-by-identifier-api-tests';
import { withAcbsUpdateFacilityByIdentifierServiceTests } from '../common-tests/acbs-update-facility-by-identifier-api-tests';
import { PutFacilityAcbsRequests } from '../support/interfaces/put-facility-by-facility-identifier-acbs-endpoints.interface.';

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
  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const facilityIdentifier = valueGenerator.facilityId();

  const updateFacilityBaseUrl = `/api/v1/facilities/${facilityIdentifier}`;

  const {
    updateFacilityRequest,
    acbsGetExistingFacilityResponse,
    acbsUpdateFacilityRequest: expectedAcbsUpdateFacilityRequest,
  } = new UpdateFacilityGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 1, facilityIdentifier });

  const expectedPutResponse = { facilityIdentifier: facilityIdentifier };

  it('returns a 400 response if the request does not have a query parameter', async () => {
    const { status, body } = await makeRequestWithUrl(updateFacilityBaseUrl);
    expect(status).toBe(400);
    expect(body).toMatchObject({
      error: 'Bad Request',
      message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate`]),
      statusCode: 400,
    });
  });

  it('returns a 400 response if the request does not have a set query parameter', async () => {
    const { status, body } = await makeRequestWithUrl(updateFacilityBaseUrl + '?op=');
    expect(status).toBe(400);
    expect(body).toMatchObject({
      error: 'Bad Request',
      message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate`]),
      statusCode: 400,
    });
  });

  it('returns a 400 response if the query parameter is not supported', async () => {
    const InvalidUpdateFacilityUrl = updateFacilityBaseUrl + `?op=invalidEnum`;

    const { status, body } = await makeRequestWithUrl(InvalidUpdateFacilityUrl);

    expect(status).toBe(400);
    expect(body).toMatchObject({
      error: 'Bad Request',
      message: expect.arrayContaining([`op must be one of the following values: issue, amendExpiryDate`]),
      statusCode: 400,
    });
  });

  describe.each([{ queryToTest: ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE }, { queryToTest: ENUMS.FACILITY_UPDATE_OPERATIONS.AMEND_EXPIRY_DATE }])(
    'PUT /facilities?op=$queryToTest',
    ({ queryToTest }) => {
      const updateFacilityUrl = updateFacilityBaseUrl + `?op=${queryToTest}`;

      // We have an exception thrown on the ISSUE endpoint if issue date is null or undefined.
      // We therefore run these checks seperately
      const includeIssueDateInFieldValidation = queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE;

      const { idToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
        givenRequestWouldOtherwiseSucceed: () => {
          givenRequestToGetFacilityInAcbsSucceeds();
          givenRequestToUpdateFacilityInAcbsSucceeds();
        },
        makeRequest: () => makeRequest(),
      });

      if (queryToTest === ENUMS.FACILITY_UPDATE_OPERATIONS.ISSUE) {
        const unissuedFacilityStageCode = TEST_FACILITY_STAGE_CODE.unissuedFacilityStageCode;
        it('returns a 400 response if request has an unissued facility stage code', async () => {
          givenTheRequestWouldOtherwiseSucceed();

          const modifiedUpdateFacilityRequest = { ...updateFacilityRequest, facilityStageCode: unissuedFacilityStageCode };

          const { status, body } = await makeRequestWithBody(modifiedUpdateFacilityRequest);

          expect(status).toBe(400);
          expect(body).toStrictEqual({ message: 'Bad request', error: 'Facility stage code is not issued', statusCode: 400 });
        });

        it('returns a 400 response if request has no issue date', async () => {
          givenTheRequestWouldOtherwiseSucceed();

          const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };
          delete modifiedUpdateFacilityRequest.issueDate;

          const { status, body } = await makeRequestWithBody(modifiedUpdateFacilityRequest);

          expect(status).toBe(400);
          expect(body).toStrictEqual({ message: 'Bad request', error: 'Issue date is not present', statusCode: 400 });
        });

        it('returns a 400 response if request has an issue date of null', async () => {
          givenTheRequestWouldOtherwiseSucceed();

          const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };
          modifiedUpdateFacilityRequest.issueDate = null;

          const { status, body } = await makeRequestWithBody(modifiedUpdateFacilityRequest);

          expect(status).toBe(400);
          expect(body).toStrictEqual({ message: 'Bad request', error: 'Issue date is not present', statusCode: 400 });
        });

        it('returns a 400 response if request has an issue date of undefined', async () => {
          givenTheRequestWouldOtherwiseSucceed();

          const modifiedUpdateFacilityRequest = { ...updateFacilityRequest };
          modifiedUpdateFacilityRequest.issueDate = undefined;

          const { status, body } = await makeRequestWithBody(modifiedUpdateFacilityRequest);

          expect(status).toBe(400);
          expect(body).toStrictEqual({ message: 'Bad request', error: 'Issue date is not present', statusCode: 400 });
        });
      }

      withClientAuthenticationTests({
        givenTheRequestWouldOtherwiseSucceed: () => requestToUpdateFacility(),
        makeRequestWithoutAuth: () => makeRequestWithoutAuth(),
      });

      it('returns a 200 response with the facility identifier if the facility has been successfully updated in ACBS', async () => {
        const requests = givenTheRequestWouldOtherwiseSucceed();
        const { status, body } = await makeRequest();

        expect(status).toBe(200);
        expect(body).toStrictEqual(expectedPutResponse);

        expect(requests.acbsGetRequest.isDone()).toBe(true);
        expect(requests.acbsUpdateRequest.isDone()).toBe(true);
      });

      withBaseFacilityFieldsValidationApiTests({
        valueGenerator,
        validRequestBody: updateFacilityRequest,
        makeRequest: (body) => makeRequestWithBody(body),
        givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
        includeIssueDate: includeIssueDateInFieldValidation,
      });

      withAcbsUpdateFacilityByIdentifierServiceTests({
        givenTheRequestWouldOtherwiseSucceed: () => {
          givenRequestToGetFacilityInAcbsSucceeds();
          givenAuthenticationWithTheIdpSucceeds();
        },
        requestToUpdateFacility: () => requestToUpdateFacility(),
        makeRequest: () => makeRequest(),
      });

      withAcbsGetFacilityServiceCommonTests({
        givenTheRequestWouldOtherwiseSucceed: () => {
          givenRequestToUpdateFacilityInAcbsSucceeds();
          givenAuthenticationWithTheIdpSucceeds();
        },
        requestToGetFacility: () => requestToGetFacility(),
        makeRequest: () => makeRequest(),
      });

      const makeRequestWithBody = (body: unknown): supertest.Test => makeRequestWithUrlAndBody(updateFacilityUrl, body);

      const makeRequest = (): supertest.Test => makeRequestWithUrlAndBody(updateFacilityUrl, updateFacilityRequest);

      const makeRequestWithoutAuth = (incorrectAuth?: IncorrectAuthArg) =>
        api.putWithoutAuth(updateFacilityBaseUrl, updateFacilityRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue);

      const requestToUpdateFacility = () => {
        const requestToUpdateFacilityWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
          nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .put(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBody)
            .matchHeader('authorization', `Bearer ${idToken}`);

        return requestToUpdateFacilityWithBody(JSON.parse(JSON.stringify(expectedAcbsUpdateFacilityRequest)));
      };

      const givenRequestToUpdateFacilityInAcbsSucceeds = () =>
        requestToUpdateFacility().reply(200, undefined, {
          location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`,
        });

      const givenRequestToGetFacilityInAcbsSucceeds = () => requestToGetFacility().reply(200, acbsGetExistingFacilityResponse);

      const givenAnyRequestBodyWouldSucceed = (): PutFacilityAcbsRequests => {
        const givenAnyRequestToGetFacilityInAcbsSucceeds = (): nock.Scope => {
          const requestBodyPlaceholder = '*';
          return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
            .filteringRequestBody(() => requestBodyPlaceholder)
            .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`, requestBodyPlaceholder)
            .matchHeader('authorization', `Bearer ${idToken}`)
            .reply(200, acbsGetExistingFacilityResponse, { location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}` });
        };

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

        givenAuthenticationWithTheIdpSucceeds();
        return { acbsGetRequest: givenAnyRequestToGetFacilityInAcbsSucceeds(), acbsUpdateRequest: givenAnyRequestBodyToUpdateFacilityInAcbsSucceeds() };
      };

      const givenTheRequestWouldOtherwiseSucceed = (): PutFacilityAcbsRequests => {
        givenAuthenticationWithTheIdpSucceeds();
        return { acbsGetRequest: givenRequestToGetFacilityInAcbsSucceeds(), acbsUpdateRequest: givenRequestToUpdateFacilityInAcbsSucceeds() };
      };
      const requestToGetFacility = () =>
        nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
          .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
          .matchHeader('authorization', `Bearer ${idToken}`);
    },
  );

  const makeRequestWithUrlAndBody = (url: string, body: unknown): supertest.Test => api.put(url, JSON.parse(JSON.stringify(body)));

  const makeRequestWithUrl = (url: string): supertest.Test => makeRequestWithUrlAndBody(url, updateFacilityRequest);
});

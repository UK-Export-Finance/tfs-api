import nock from 'nock';
import { PROPERTIES } from '@ukef/constants';
import { AcbsGetLoanByLoanIdentifierResponseDto } from '@ukef/modules/acbs/dto/acbs-get-loan-by-loan-identifier-response.dto';
import { AcbsUpdateLoanRequest } from '@ukef/modules/acbs/dto/acbs-update-loan-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { withLoanIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/loan-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UpdateLoanGenerator } from '@ukef-test/support/generator/update-loan-generator';

describe('PATCH /facilities/{facilityIdentifier}/loans/{loanIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const loanIdentifier = valueGenerator.loanId();

  const { acbsUpdateLoanRequest, updateLoanExpiryDateRequest, acbsGetExistingLoanResponse } = new UpdateLoanGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
    loanIdentifier,
  });

  const getUpdateExpiryDateUrl = ({ facilityId, loanId }: { facilityId: string; loanId: string }) => `/api/v1/facilities/${facilityId}/loans/${loanId}`;

  let api: Api;
  let idToken: string;

  const makeRequest = (requestBody: unknown) =>
    api.patch(getUpdateExpiryDateUrl({ facilityId: facilityIdentifier, loanId: loanIdentifier }), JSON.parse(JSON.stringify(requestBody)));

  const requestToGetLoanInAcbs = (loanId = loanIdentifier) =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Portfolio/${portfolioIdentifier}/Loan/${loanId}`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToGetLoanInAcbsSucceedsWithResponse = (getLoanResponse: AcbsGetLoanByLoanIdentifierResponseDto, loanId = loanIdentifier) => {
    requestToGetLoanInAcbs(loanId).reply(200, getLoanResponse);
  };

  const givenRequestToGetLoanInAcbsSucceeds = (loanId = loanIdentifier) => {
    givenRequestToGetLoanInAcbsSucceedsWithResponse(acbsGetExistingLoanResponse, loanId);
  };

  const requestToUpdateLoanInAcbs = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).put(`/Portfolio/${portfolioIdentifier}/Loan/${loanIdentifier}`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToUpdateLoanInAcbsSucceedsWithResponse = (updateLoanRequest: AcbsUpdateLoanRequest) => {
    requestToUpdateLoanInAcbs().reply(200, updateLoanRequest);
  };

  const givenRequestToUpdateLoanInAcbsSucceeds = () => {
    givenRequestToUpdateLoanInAcbsSucceedsWithResponse(acbsUpdateLoanRequest);
  };

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

  const { idToken: resolvedIdToken, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => {
      givenRequestToGetLoanInAcbsSucceeds();
      givenRequestToUpdateLoanInAcbsSucceeds();
    },
    makeRequest: () => makeRequest(updateLoanExpiryDateRequest),
    successStatusCode: 200,
  });
  idToken = resolvedIdToken;

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetLoanInAcbsSucceeds();
      givenRequestToUpdateLoanInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.patchWithoutAuth(
        getUpdateExpiryDateUrl({ facilityId: facilityIdentifier, loanId: loanIdentifier }),
        updateLoanExpiryDateRequest,
        incorrectAuth?.headerName,
        incorrectAuth?.headerValue,
      ),
  });

  describe.each([
    {
      endpointTestType: 'ACBS get loan',
      givenTheRequestWouldOtherwiseSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToUpdateLoanInAcbsSucceeds();
      },
      requestToAcbsEndpoint: () => requestToGetLoanInAcbs(),
      makeRequest: () => makeRequest(updateLoanExpiryDateRequest),
      expectedStatusCodeForAcbs400Error: 500,
      getExpectedErrorForAcbs400Error: () => ({
        statusCode: 500,
        message: 'Internal server error',
      }),
    },
    {
      endpointTestType: 'ACBS update loan',
      givenTheRequestWouldOtherwiseSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetLoanInAcbsSucceeds();
      },
      requestToAcbsEndpoint: () => requestToUpdateLoanInAcbs(),
      makeRequest: () => makeRequest(updateLoanExpiryDateRequest),
      expectedStatusCodeForAcbs400Error: 400,
      getExpectedErrorForAcbs400Error: (error) => ({ message: 'Bad request', statusCode: 400, error }),
    },
  ])(
    '$endpointTestType',
    ({
      endpointTestType,
      givenTheRequestWouldOtherwiseSucceed,
      requestToAcbsEndpoint,
      makeRequest: makeTestRequest,
      expectedStatusCodeForAcbs400Error,
      getExpectedErrorForAcbs400Error,
    }) => {
      it(`returns a ${expectedStatusCodeForAcbs400Error} response if ${endpointTestType} responds with a 400 response that does not contain a known error`, async () => {
        givenTheRequestWouldOtherwiseSucceed();
        const acbsErrorMessage = 'ACBS error message';
        requestToAcbsEndpoint().reply(400, acbsErrorMessage);

        const { status, body } = await makeTestRequest();

        expect(status).toBe(expectedStatusCodeForAcbs400Error);
        expect(body).toStrictEqual(getExpectedErrorForAcbs400Error(acbsErrorMessage));
      });

      it(`returns a ${expectedStatusCodeForAcbs400Error} response if ${endpointTestType} responds with a 400 response that is not a string`, async () => {
        givenTheRequestWouldOtherwiseSucceed();
        const acbsErrorMessage = { Message: 'ACBS error message' };
        requestToAcbsEndpoint().reply(400, acbsErrorMessage);

        const { status, body } = await makeTestRequest();

        expect(status).toBe(expectedStatusCodeForAcbs400Error);
        expect(body).toStrictEqual(getExpectedErrorForAcbs400Error(JSON.stringify(acbsErrorMessage)));
      });

      it(`returns a 404 response if ${endpointTestType} responds with a 400 response`, async () => {
        givenTheRequestWouldOtherwiseSucceed();
        requestToAcbsEndpoint().reply(400, 'Loan not found');

        const { status, body } = await makeTestRequest();

        expect(status).toBe(404);
        expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
      });

      it(`returns a 500 response if ${endpointTestType} responds with an error code that is not 400"`, async () => {
        givenTheRequestWouldOtherwiseSucceed();
        requestToAcbsEndpoint().reply(401, 'Unauthorized');

        const { status, body } = await makeTestRequest();

        expect(status).toBe(500);
        expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
      });

      it(`returns a 500 response if ${endpointTestType} times out`, async () => {
        givenTheRequestWouldOtherwiseSucceed();
        requestToAcbsEndpoint().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

        const { status, body } = await makeTestRequest();

        expect(status).toBe(500);
        expect(body).toStrictEqual({
          statusCode: 500,
          message: 'Internal server error',
        });
      });
    },
  );

  describe('field validation', () => {
    withDateOnlyFieldValidationApiTests({
      fieldName: 'expiryDate',
      validRequestBody: updateLoanExpiryDateRequest,
      makeRequest: (body: unknown) => makeRequest(body),
      givenAnyRequestBodyWouldSucceed: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetLoanInAcbsSucceeds();
        givenRequestToUpdateLoanInAcbsSucceeds();
      },
    });
  });

  describe('URL parameter validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      makeRequestWithFacilityId: (facilityId: string) => api.patch(getUpdateExpiryDateUrl({ facilityId, loanId: loanIdentifier }), updateLoanExpiryDateRequest),
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetLoanInAcbsSucceeds();
        givenRequestToUpdateLoanInAcbsSucceeds();
      },
      successStatusCode: 200,
    });

    withLoanIdentifierUrlValidationApiTests({
      makeRequestWithLoanId: (loanId: string) => api.patch(getUpdateExpiryDateUrl({ facilityId: facilityIdentifier, loanId }), updateLoanExpiryDateRequest),
      givenRequestWouldOtherwiseSucceedForLoanId: (loanId: string) => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetLoanInAcbsSucceeds(loanId);
        givenRequestToUpdateLoanInAcbsSucceeds();
      },
      successStatusCode: 200,
    });
  });
});

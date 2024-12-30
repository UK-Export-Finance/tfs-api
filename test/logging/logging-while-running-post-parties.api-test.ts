import { ENUMS } from '@ukef/constants';
import { AcbsCreatePartyExternalRatingRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-external-rating-request.dto';
import { AcbsCreatePartyRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-request.dto';
import { AcbsGetPartiesBySearchTextResponseDto } from '@ukef/modules/acbs/dto/acbs-get-parties-by-search-text-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreatePartyExternalRatingGenerator } from '@ukef-test/support/generator/create-party-external-rating-generator';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockMdmApi } from '@ukef-test/support/mdm-api.mock';
import nock from 'nock';
import { Stream } from 'stream';

describe('POST /parties log testing', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const partyIdentifier = valueGenerator.acbsPartyId();
  const basePartyAlternateIdentifier = valueGenerator.stringOfNumericCharacters({ length: 7 });
  const alternateIdentifier = `${basePartyAlternateIdentifier}0`;
  const nonSovereignCustomerType = valueGenerator.string();

  const createPartyUrl = `/api/v1/parties`;

  const { acbsParties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
  const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponseDto = [
    { ...acbsParties[0], PartyIdentifier: partyIdentifier },
    { ...acbsParties[1], PartyIdentifier: valueGenerator.acbsPartyId() },
  ];

  const { acbsCreatePartyRequest, apiCreatePartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
    basePartyAlternateIdentifier,
  });
  const [apiPartyToCreate] = apiCreatePartyRequest;
  const { officerRiskDate: ratedDate } = apiPartyToCreate;

  const { acbsExternalRatingToCreate } = new CreatePartyExternalRatingGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    partyIdentifier,
    assignedRatingCode: ENUMS.ASSIGNED_RATING_CODES.CORPORATE,
    ratedDate,
  });

  const customersWithCorporateType = [{ type: nonSovereignCustomerType }];

  let mdmApi: MockMdmApi;
  let api: Api;
  const stream = new Stream.Writable();

  let logContent;

  stream._write = (chunk, encoding, next) => {
    logContent += chunk.toString();
    next();
  };

  beforeAll(async () => {
    global.logTestStream = stream;
    mdmApi = new MockMdmApi(nock);
    api = await Api.create();
  });

  beforeEach(() => {
    logContent = '';
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  const { idToken, sessionCookieName, sessionId, givenAuthenticationWithTheIdpSucceeds } = withAcbsAuthenticationApiTests({
    givenRequestWouldOtherwiseSucceed: () => {
      givenAllRequestsSucceed();
    },
    makeRequest: () => api.post(createPartyUrl, apiCreatePartyRequest),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAllRequestsSucceed();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createPartyUrl, apiCreatePartyRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  describe('success cases', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 201 response with the identifier of the new party and call data is logged', async () => {
      givenAllRequestsSucceed();

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier })));

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain(`Bearer ${idToken}`);
      expect(logContent).toContain(sessionId);
      expect(logContent).toContain('Requesting a new ACBS authentication id token');
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_LOGIN_NAME);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_PASSWORD);
      expect(logContent).toContain(sessionCookieName);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.APIM_MDM_KEY);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY_HEADER_NAME);
      expect(logContent).toContain(`"data":${JSON.stringify(acbsCreatePartyRequest)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"data":${JSON.stringify(acbsExternalRatingToCreate)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"responseBody":${JSON.stringify(body)},"msg":"Returning the following response to the client."`);
    });

    it('returns a 200 response with the identifier of the first matching party if ACBS returns one or more matching parties when using the alternate identifier as search text', async () => {
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithPartyIdentifiers);
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToFindCustomersByPartyUrnSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(200);
      expect(body).toStrictEqual({ partyIdentifier });

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.APIM_MDM_KEY);
      expect(logContent).toContain(ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
      expect(logContent).not.toContain(`"data":${JSON.stringify(acbsCreatePartyRequest)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"data":${JSON.stringify(acbsExternalRatingToCreate)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"responseBody":${JSON.stringify(body)},"msg":"Returning the following response to the client."`);
    });
  });

  describe('log redacting is on', () => {
    let apiWithLogRedacting;

    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    beforeAll(async () => {
      process.env.REDACT_LOGS = 'true';
      apiWithLogRedacting = await Api.create();
      givenAllRequestsSucceed();
    });

    afterAll(async () => {
      process.env.REDACT_LOGS = 'false';
      await apiWithLogRedacting.destroy();
    });

    it('returns a 201 response with the identifier of the new party and logs are correctly redacted', async () => {
      const { status, body } = await apiWithLogRedacting.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier })));

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain('{"loginName":"[Redacted]","password":"[Redacted]"}}');
      expect(logContent).toContain('"headers":"[Redacted]"');
      expect(logContent).toContain('Requesting a new ACBS authentication id token');
      expect(logContent).toContain('Using the cached ACBS authentication id token');
      expect(logContent).not.toContain('Authorization');
      expect(logContent).not.toContain(idToken);
      expect(logContent).not.toContain(sessionId);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_LOGIN_NAME);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_PASSWORD);
      expect(logContent).not.toContain(sessionCookieName);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_KEY);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_API_KEY);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.SWAGGER_USER);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.SWAGGER_PASSWORD);
      expect(logContent).toContain(`"data":${JSON.stringify(acbsCreatePartyRequest)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"data":${JSON.stringify(acbsExternalRatingToCreate)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).toContain(`"responseBody":${JSON.stringify(body)},"msg":"Returning the following response to the client."`);
    });

    it('returns a 400 response if ACBS responds with a 400 response', async () => {
      givenRequestToGetPartiesBySearchTextSucceeds();
      const acbsErrorMessage = { Message: 'error message' };
      requestToCreateParty(acbsCreatePartyRequest).reply(400, acbsErrorMessage);

      const { status, body } = await apiWithLogRedacting.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain('AcbsBadRequestException: Failed to create party in ACBS');
      expect(logContent).toContain('AxiosError: Request failed with status code 400');
      expect(logContent).toContain('"data":'.concat(JSON.stringify(acbsErrorMessage)));

      expect(logContent).not.toContain('{"loginName":"[Redacted]","password":"[Redacted]"}}');
      expect(logContent).toContain('"headers":"[Redacted]"');
      expect(logContent).not.toContain('Authorization');
    });
  });

  describe('error cases when getting the parties by search text', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 500 response if ACBS responds with an error code that is NOT 200', async () => {
      requestToGetPartiesBySearchText(alternateIdentifier).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain(`Bearer ${idToken}`);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_KEY);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
      expect(logContent).toContain(`Failed to get parties from ACBS with search text ${alternateIdentifier}.`);
      expect(logContent).toContain(`AxiosError: Request failed with status code 401`);
      expect(logContent).not.toContain(`"data":${JSON.stringify(acbsCreatePartyRequest)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).not.toContain(`"data":${JSON.stringify(acbsExternalRatingToCreate)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).not.toContain('Returning the following response to the client.');
    });

    it('returns a 500 response if getting the parties from ACBS times out', async () => {
      requestToGetPartiesBySearchText(alternateIdentifier).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, []);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain(`Bearer ${idToken}`);
      expect(logContent).toContain(`Failed to get parties from ACBS with search text ${alternateIdentifier}.`);
      expect(logContent).toContain(`AxiosError: timeout of ${ENVIRONMENT_VARIABLES.ACBS_TIMEOUT}ms exceeded`);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_KEY);
      expect(logContent).not.toContain(ENVIRONMENT_VARIABLES.APIM_MDM_VALUE);
      expect(logContent).not.toContain(`"data":${JSON.stringify(acbsCreatePartyRequest)}},"msg":"Sending the following HTTP request."`);
      expect(logContent).not.toContain(`"data":${JSON.stringify(acbsExternalRatingToCreate)}},"msg":"Sending the following HTTP request."`);
      // Response is not logged in case of exception.
      expect(logContent).not.toContain('Returning the following response to the client.');
    });
  });

  describe('error cases when creating the party', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
    });

    it('returns a 400 response if ACBS responds with a 400 response', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToCreateParty(acbsCreatePartyRequest).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });

      expect(logContent).not.toContain('Requesting a new ACBS authentication id token');
      expect(logContent).toContain('Using the cached ACBS authentication id token');

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain('AcbsBadRequestException: Failed to create party in ACBS');
      expect(logContent).toContain('AxiosError: Request failed with status code 400');
      expect(logContent).toContain('"data":'.concat(JSON.stringify(acbsErrorMessage)));
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToCreateParty(acbsCreatePartyRequest).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).not.toContain('Requesting a new ACBS authentication id token');
      expect(logContent).toContain('Using the cached ACBS authentication id token');

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain('AcbsUnexpectedException: Failed to create party in ACBS.');
      expect(logContent).toContain('AxiosError: Request failed with status code 401');
    });

    it('returns a 500 response if creating the party in ACBS times out', async () => {
      requestToCreateParty(acbsCreatePartyRequest).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain(`"stack":"AxiosError: timeout of ${ENVIRONMENT_VARIABLES.ACBS_TIMEOUT}ms exceeded`);
      expect(logContent).toContain('"stack":"AcbsUnexpectedException: Failed to create party in ACBS');
      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
    });
  });

  describe('error cases when getting the external ratings', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
    });

    it(`returns a 404 response if ACBS responds with a 400 response that is a string containing 'Party not found'`, async () => {
      const acbsErrorMessage = 'Party not found or user does not have access.';
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });

      expect(logContent).toContain(`"stack":"AxiosError: Request failed with status code 400`);
      expect(logContent).toContain(`"stack":"AcbsResourceNotFoundException: Party with identifier ${partyIdentifier} was not found by ACBS.`);
      expect(logContent).toContain(`"message":"Party with identifier ${partyIdentifier} was not found by ACBS."`);
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is a string that does not contain 'Party not found'`, async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).toContain('"stack":"AxiosError: Request failed with status code 400');
      expect(logContent).toContain(`"stack":"AcbsException: Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response.');
      expect(logContent).toContain(`"message":"Failed to get the external ratings for the party with id ${partyIdentifier}."`);
      expect(logContent).toContain(`"incomingResponse":{"data":"${acbsErrorMessage}",`);
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is not a string`, async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).toContain('"stack":"AxiosError: Request failed with status code 400');
      expect(logContent).toContain(`"stack":"AcbsException: Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response.');
      expect(logContent).toContain(`"message":"Failed to get the external ratings for the party with id ${partyIdentifier}."`);
      expect(logContent).toContain(`"incomingResponse":{"data":${acbsErrorMessage},`);
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToGetPartyExternalRatings().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).toContain('"stack":"AxiosError: Request failed with status code 401');
      expect(logContent).toContain(`"stack":"AcbsException: Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response.');
      expect(logContent).toContain(`"message":"Failed to get the external ratings for the party with id ${partyIdentifier}."`);
    });

    it('returns a 500 response if getting the external ratings from ACBS times out', async () => {
      requestToGetPartyExternalRatings().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, []);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain(`"stack":"AxiosError: timeout of ${ENVIRONMENT_VARIABLES.ACBS_TIMEOUT}ms exceeded`);
      expect(logContent).toContain(`"stack":"AcbsException: Failed to get the external ratings for the party with id ${partyIdentifier}.`);
      expect(logContent).toContain('"msg":"A HTTP server failed to respond to our request.');
      expect(logContent).toContain(`"message":"Failed to get the external ratings for the party with id ${partyIdentifier}."`);
    });
  });

  describe('error cases when searching for the party as a customer in MDM', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();
    });

    it(`returns a 500 response if MDM responds with an error code that is not 404 when searching for the party as a customer`, async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain('"stack":"AxiosError: Request failed with status code 401');
      expect(logContent).toContain(`"message":"Failed to find customers with partyUrn ${alternateIdentifier} in MDM."`);
      expect(logContent).toContain(`"incomingResponse":{"data":"Unauthorized",`); // GOOD
      expect(logContent).toContain(`"stack":"MdmException: Failed to find customers with partyUrn ${alternateIdentifier} in MDM.`); // GOOD
    });

    it(`returns a 500 response if searching for the party as a customer in MDM times out`, async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).timesOutWith(200, [{ type: valueGenerator.string() }]);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain(`"stack":"AxiosError: timeout of ${ENVIRONMENT_VARIABLES.ACBS_TIMEOUT}ms exceeded`);
      expect(logContent).toContain(`"stack":"MdmException: Failed to find customers with partyUrn ${alternateIdentifier} in MDM.`);
      expect(logContent).toContain('"msg":"A HTTP server failed to respond to our request.');
      expect(logContent).toContain(`"message":"Failed to find customers with partyUrn ${alternateIdentifier} in MDM."`);
    });
  });

  describe('error cases when creating the external rating', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToFindCustomersByPartyUrnSucceeds();
    });

    it(`returns a 404 response if ACBS responds with a 400 response that is a string containing 'partyIdentifier is not valid'`, async () => {
      const acbsErrorMessage = 'partyIdentifier is not valid';
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });

      expect(logContent).toContain(`"stack":"AxiosError: Request failed with status code 400`);
      expect(logContent).toContain(`"incomingResponse":{"data":"${acbsErrorMessage}",`);
      expect(logContent).toContain(`"stack":"AcbsResourceNotFoundException: Party with identifier ${partyIdentifier} was not found by ACBS.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response."');
      expect(logContent).toContain(`"message":"Party with identifier ${partyIdentifier} was not found by ACBS."`);
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is a string that does not contain 'partyIdentifier is not valid'`, async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });

      expect(logContent).toContain(`"stack":"AxiosError: Request failed with status code 400`);
      expect(logContent).toContain(`"incomingResponse":{"data":"${acbsErrorMessage}",`);
      expect(logContent).toContain(`"stack":"AcbsBadRequestException: Failed to create party external rating in ACBS.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response."');
      expect(logContent).toContain(`"message":"Failed to create party external rating in ACBS.`);
      expect(logContent).toContain(`"message":"Request failed with status code 400`);
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is not a string`, async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });

      expect(logContent).toContain(`"stack":"AxiosError: Request failed with status code 400`);
      expect(logContent).toContain(`"incomingResponse":{"data":${JSON.stringify(acbsErrorMessage)},`);
      expect(logContent).toContain(`"stack":"AcbsBadRequestException: Failed to create party external rating in ACBS.`);
      expect(logContent).toContain('"msg":"A HTTP server responded to our request with an error response."');
      expect(logContent).toContain(`"message":"Failed to create party external rating in ACBS.`);
      expect(logContent).toContain(`"message":"Request failed with status code 400`);
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });

      expect(logContent).toContain(`"requestBody":${JSON.stringify(apiCreatePartyRequest)},"msg":"Handling the following request from the client."`);
      expect(logContent).toContain('"stack":"AcbsUnexpectedException: Failed to create party external rating in ACBS.');
      expect(logContent).toContain('"stack":"AxiosError: Request failed with status code 401');
    });

    it('returns a 500 response if creating the external rating in ACBS times out', async () => {
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(logContent).toContain(`"stack":"AxiosError: timeout of ${ENVIRONMENT_VARIABLES.ACBS_TIMEOUT}ms exceeded`);
      expect(logContent).toContain('"stack":"AcbsUnexpectedException: Failed to create party external rating in ACBS.');
      expect(logContent).toContain('"msg":"A HTTP server failed to respond to our request.');
      expect(logContent).toContain('"message":"Failed to create party external rating in ACBS."');
    });
  });

  describe('field validation', () => {
    it(`returns a 400 if request contains field that doesn't match validation rules`, async () => {
      const emptyRequest = [{}];
      const { status, body } = await api.post(createPartyUrl, emptyRequest);

      expect(status).toBe(400);
      expect(body.message).toContain('alternateIdentifier must be a string');

      expect(logContent).toContain(
        '{"message":["alternateIdentifier must be a string","alternateIdentifier must be longer than or equal to 8 characters","alternateIdentifier must match /^\\\\d{8}$/ regular expression","industryClassification must be a string","industryClassification must be longer than or equal to 1 characters","name1 must be a string","name1 must be longer than or equal to 1 characters","smeType must be a string","smeType must be longer than or equal to 1 characters","citizenshipClass must be a string","citizenshipClass must be longer than or equal to 1 characters","citizenshipClass must be one of the following values: 1, 2","officerRiskDate must be a valid ISO 8601 date string","officerRiskDate must match /^\\\\d{4}-\\\\d{2}-\\\\d{2}$/ regular expression"],"error":"Bad Request","statusCode":400}',
      );
    });
  });

  const givenRequestToGetPartiesBySearchTextSucceeds = (): nock.Scope => {
    return requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
  };

  const requestToGetPartiesBySearchText = (searchText: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreatePartySucceeds = (): nock.Scope => {
    return requestToCreateParty(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });
  };

  const requestToCreateParty = (request: AcbsCreatePartyRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post('/Party', JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenRequestToGetPartyExternalRatingsSucceeds = (): nock.Scope => {
    return requestToGetPartyExternalRatings().reply(200, []);
  };

  const requestToGetPartyExternalRatings = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/${partyIdentifier}/PartyExternalRating`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreatePartyExternalRatingSucceeds = (): nock.Scope => {
    return requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(201);
  };

  const requestToCreatePartyExternalRating = (request: AcbsCreatePartyExternalRatingRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Party/${partyIdentifier}/PartyExternalRating`, JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenRequestToFindCustomersByPartyUrnSucceeds = (): void => {
    mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, customersWithCorporateType);
  };

  const givenAllRequestsSucceed = (): void => {
    givenRequestToGetPartiesBySearchTextSucceeds();
    givenRequestToCreatePartySucceeds();
    givenRequestToGetPartyExternalRatingsSucceeds();
    givenRequestToCreatePartyExternalRatingSucceeds();
    givenRequestToFindCustomersByPartyUrnSucceeds();
  };
});

import { ENUMS } from '@ukef/constants';
import { AcbsCreatePartyExternalRatingRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-external-rating-request.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { AcbsCreatePartyRequestDto } from '@ukef/modules/party/dto/acbs-create-party-request.dto';
import { AcbsGetPartiesBySearchTextResponseDto } from '@ukef/modules/party/dto/acbs-get-parties-by-search-text-response.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreatePartyExternalRatingGenerator } from '@ukef-test/support/generator/create-party-external-rating-generator';
import { CreatePartyGenerator } from '@ukef-test/support/generator/create-party-generator';
import { GetPartyGenerator } from '@ukef-test/support/generator/get-party-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /parties', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const partyIdentifier = valueGenerator.acbsPartyId();
  const alternateIdentifier = valueGenerator.stringOfNumericCharacters({ length: 8 });

  const createPartyUrl = `/api/v1/parties`;

  const { acbsParties } = new GetPartyGenerator(valueGenerator, dateStringTransformations).generate({ numberToGenerate: 2 });
  const partiesInAcbsWithPartyIdentifiers: AcbsGetPartiesBySearchTextResponseDto = [
    { ...acbsParties[0], PartyIdentifier: partyIdentifier },
    { ...acbsParties[1], PartyIdentifier: valueGenerator.acbsPartyId() },
  ];

  const { acbsCreatePartyRequest, apiCreatePartyRequest } = new CreatePartyGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 2,
  });
  const [apiPartyToCreate] = apiCreatePartyRequest;
  const { officerRiskDate: ratedDate } = apiPartyToCreate;
  apiPartyToCreate.alternateIdentifier = alternateIdentifier;
  acbsCreatePartyRequest.PartyAlternateIdentifier = alternateIdentifier;

  const { acbsExternalRatingToCreate } = new CreatePartyExternalRatingGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    partyIdentifier,
    assignedRatingCode: '01',
    ratedDate,
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

    it('returns a 201 response with the identifier of the new party if ACBS returns a location header containing this', async () => {
      givenAllRequestsSucceed();

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(201);
      expect(body).toStrictEqual(JSON.parse(JSON.stringify({ partyIdentifier })));
    });

    it('returns a 200 response with the identifier of the first matching party if ACBS returns one or more matching parties when using the alternate identifier as search text', async () => {
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithPartyIdentifiers);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(200);
      expect(body).toStrictEqual({ partyIdentifier });
    });

    it("returns a 200 response with an empty object if ACBS returns one or more matching parties when using the alternate identifier as search text but the first matching party's PartyIdentifier is equal to the empty string", async () => {
      const partiesInAcbsWithEmptyPartyIdentifier = JSON.parse(JSON.stringify(partiesInAcbsWithPartyIdentifiers));
      partiesInAcbsWithEmptyPartyIdentifier[0].PartyIdentifier = '';

      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithEmptyPartyIdentifier);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(200);
      expect(body).toStrictEqual({});
    });
  });

  describe('error cases when getting the parties by search text', () => {
    it('returns a 500 response if ACBS responds with an error code that is NOT 200', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if getting the parties from ACBS times out', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetPartiesBySearchText(alternateIdentifier).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, []);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when creating the party', () => {
    it('returns a 400 response if ACBS responds with a 400 response', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = { Message: 'error message' };
      givenRequestToGetPartiesBySearchTextSucceeds();
      requestToCreateParty(acbsCreatePartyRequest).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      requestToCreateParty(acbsCreatePartyRequest).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if creating the party in ACBS times out', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      requestToCreateParty(acbsCreatePartyRequest).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when getting the external ratings', () => {
    it(`returns a 404 response if ACBS responds with a 400 response that is a string containing 'Party not found'`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = 'Party not found or user does not have access.';
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is a string that does not contain 'Party not found'`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = 'ACBS error message';
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is not a string`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      requestToGetPartyExternalRatings().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if getting the external ratings from ACBS times out', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      requestToGetPartyExternalRatings().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, []);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when creating the external rating', () => {
    it(`returns a 404 response if ACBS responds with a 400 response that is a string containing 'partyIdentifier is not valid'`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = 'partyIdentifier is not valid';
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it(`returns a 400 response with the correct error string if ACBS responds with a 400 response that is a string containing 'PartyExternalRating exists'`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = 'PartyExternalRating exists';
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad request',
        error: 'Party external rating with this assignedRatingCode and ratedDate combination already exists.',
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is a string that does not contain 'partyIdentifier is not valid' or 'PartyExternalRating exists'`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = 'ACBS error message';
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is not a string`, async () => {
      givenAuthenticationWithTheIdpSucceeds();
      const acbsErrorMessage = { Message: 'error message' };
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if creating the external rating in ACBS times out', async () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(createPartyUrl, body);
    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestToGetPartiesBySearchTextSucceeds();
      givenAnyRequestBodyToCreatePartySucceeds();
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenAnyRequestBodyToCreatePartyExternalRatingSucceeds();
    };

    withStringFieldValidationApiTests({
      fieldName: 'alternateIdentifier',
      length: 8,
      generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
      generateFieldValueThatDoesNotMatchRegex: () => 'abcdefgh',
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'industryClassification',
      minLength: 1,
      maxLength: 10,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'name1',
      minLength: 1,
      maxLength: 35,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'name2',
      required: false,
      minLength: 0,
      maxLength: 35,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'name3',
      required: false,
      minLength: 0,
      maxLength: 35,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'smeType',
      minLength: 1,
      maxLength: 2,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'citizenshipClass',
      length: 1,
      generateFieldValueOfLength: (length: number) =>
        length === 1 ? ['1', '2'][valueGenerator.integer({ min: 0, max: 1 })] : valueGenerator.string({ length }),
      enum: ENUMS.CITIZENSHIP_CLASSES,
      generateFieldValueThatDoesNotMatchEnum: () => '3',
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'officerRiskDate',
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'countryCode',
      required: false,
      minLength: 0,
      maxLength: 3,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: apiCreatePartyRequest,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  const givenRequestToGetPartiesBySearchTextSucceeds = (): nock.Scope => {
    return requestToGetPartiesBySearchText(alternateIdentifier).reply(200, []);
  };

  const requestToGetPartiesBySearchText = (searchText: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/Party/Search/${searchText}`).matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestToGetPartiesBySearchTextSucceeds = (): nock.Scope =>
    nock(`${ENVIRONMENT_VARIABLES.ACBS_BASE_URL}/Party/Search/`).get(/.*/).matchHeader('authorization', `Bearer ${idToken}`).reply(200, []);

  const givenRequestToCreatePartySucceeds = (): nock.Scope => {
    return requestToCreateParty(acbsCreatePartyRequest).reply(201, undefined, { Location: `/Party/${partyIdentifier}` });
  };

  const requestToCreateParty = (request: AcbsCreatePartyRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post('/Party', JSON.stringify(request))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyRequestBodyToCreatePartySucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post('/Party', requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, { Location: `/Party/${partyIdentifier}` });
  };

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

  const givenAnyRequestBodyToCreatePartyExternalRatingSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Party/${partyIdentifier}/PartyExternalRating`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201);
  };

  const givenAllRequestsSucceed = (): void => {
    givenRequestToGetPartiesBySearchTextSucceeds();
    givenRequestToCreatePartySucceeds();
    givenRequestToGetPartyExternalRatingsSucceeds();
    givenRequestToCreatePartyExternalRatingSucceeds();
  };
});

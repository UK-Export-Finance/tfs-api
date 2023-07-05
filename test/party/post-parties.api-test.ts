import { ENUMS, UKEFID } from '@ukef/constants';
import { SOVEREIGN_ACCOUNT_TYPES } from '@ukef/constants/sovereign-account-types.constant';
import { AcbsCreatePartyExternalRatingRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-external-rating-request.dto';
import { AcbsCreatePartyRequestDto } from '@ukef/modules/acbs/dto/acbs-create-party-request.dto';
import { AcbsGetPartiesBySearchTextResponseDto } from '@ukef/modules/acbs/dto/acbs-get-parties-by-search-text-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
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
import { MockMdmApi } from '@ukef-test/support/mdm-api.mock';
import nock from 'nock';

describe('POST /parties', () => {
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

  beforeAll(async () => {
    mdmApi = new MockMdmApi(nock);
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
      givenRequestToGetPartyExternalRatingsSucceeds();
      givenRequestToFindCustomersByPartyUrnSucceeds();
      givenRequestToCreatePartyExternalRatingSucceeds();

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(200);
      expect(body).toStrictEqual({ partyIdentifier });
    });
  });

  describe.each([
    {
      description: 'external rating creation success cases when no party already exists with the alternateIdentifier and no external ratings exist',
      successStatusCode: 201,
      setUpScenario: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetPartiesBySearchTextSucceeds();
        givenRequestToCreatePartySucceeds();
        givenRequestToGetPartyExternalRatingsSucceeds();
      },
    },
    {
      description: 'external rating creation success cases when a party already exists with the alternateIdentifier and no external ratings exist',
      successStatusCode: 200,
      setUpScenario: () => {
        givenAuthenticationWithTheIdpSucceeds();
        requestToGetPartiesBySearchText(alternateIdentifier).reply(200, partiesInAcbsWithPartyIdentifiers);
        givenRequestToGetPartyExternalRatingsSucceeds();
      },
    },
  ])('$description', ({ successStatusCode, setUpScenario }) => {
    beforeEach(() => {
      setUpScenario();
    });

    it.each(SOVEREIGN_ACCOUNT_TYPES)(
      'creates an external rating for the party with SOVEREIGN assigned rating code if the party customer type in MDM is %s',
      async (customerType) => {
        mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, [{ type: customerType }]);
        const requestToCreateSovereignExternalRating = givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds(
          ENUMS.ASSIGNED_RATING_CODES.SOVEREIGN,
        );

        const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

        expect(status).toBe(successStatusCode);
        expect(body).toStrictEqual({ partyIdentifier });
        expect(requestToCreateSovereignExternalRating.isDone()).toBe(true);
      },
    );

    it('creates an external rating for the party with CORPORATE assigned rating code if the party customer type in MDM is null', async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, [{ type: null }]);
      const requestToCreateCorporateExternalRating = givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds(
        ENUMS.ASSIGNED_RATING_CODES.CORPORATE,
      );

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(successStatusCode);
      expect(body).toStrictEqual({ partyIdentifier });
      expect(requestToCreateCorporateExternalRating.isDone()).toBe(true);
    });

    it('creates an external rating for the party with CORPORATE assigned rating code if the party customer type in MDM is not a sovereign type', async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, [{ type: nonSovereignCustomerType }]);
      const requestToCreateCorporateExternalRating = givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds(
        ENUMS.ASSIGNED_RATING_CODES.CORPORATE,
      );

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(successStatusCode);
      expect(body).toStrictEqual({ partyIdentifier });
      expect(requestToCreateCorporateExternalRating.isDone()).toBe(true);
    });

    it('creates an external rating for the party with CORPORATE assigned rating code if no matching customers are found in MDM', async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, []);
      const requestToCreateCorporateExternalRating = givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds(
        ENUMS.ASSIGNED_RATING_CODES.CORPORATE,
      );

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(successStatusCode);
      expect(body).toStrictEqual({ partyIdentifier });
      expect(requestToCreateCorporateExternalRating.isDone()).toBe(true);
    });

    it('creates an external rating for the party with CORPORATE assigned rating code if finding matching customers for the party in MDM responds with a 404 error', async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(404);
      const requestToCreateCorporateExternalRating = givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds(
        ENUMS.ASSIGNED_RATING_CODES.CORPORATE,
      );

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(successStatusCode);
      expect(body).toStrictEqual({ partyIdentifier });
      expect(requestToCreateCorporateExternalRating.isDone()).toBe(true);
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
    });

    it('returns a 500 response if getting the parties from ACBS times out', async () => {
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
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToCreateParty(acbsCreatePartyRequest).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if creating the party in ACBS times out', async () => {
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
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is a string that does not contain 'Party not found'`, async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it(`returns a 500 response if ACBS responds with a 400 response that is not a string`, async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToGetPartyExternalRatings().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToGetPartyExternalRatings().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if getting the external ratings from ACBS times out', async () => {
      requestToGetPartyExternalRatings().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, []);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when searching for the party as a customer in MDM', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetPartiesBySearchTextSucceeds();
      givenRequestToCreatePartySucceeds();
    });

    it(`returns a 500 response if MDM responds with an error code that is not 404 when searching for the party as a customer`, async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });

    it(`returns a 500 response if searching for the party as a customer in MDM times out`, async () => {
      mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).timesOutWith(200, [{ type: valueGenerator.string() }]);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
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
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is a string that does not contain 'partyIdentifier is not valid'`, async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it(`returns a 400 response if ACBS responds with a 400 response that is not a string`, async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400', async () => {
      requestToCreatePartyExternalRating(acbsExternalRatingToCreate).reply(401, 'Unauthorized');

      const { status, body } = await api.post(createPartyUrl, apiCreatePartyRequest);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if creating the external rating in ACBS times out', async () => {
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
      givenRequestToGetFindCustomersByAnyPartyUrnSucceeds();
      givenAnyRequestBodyToCreatePartyExternalRatingSucceeds();
    };

    withStringFieldValidationApiTests({
      fieldName: 'alternateIdentifier',
      length: 8,
      generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
      pattern: UKEFID.PARTY_ID.REGEX,
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
      generateFieldValueOfLength: (length: number) => (length === 1 ? valueGenerator.enumValue(ENUMS.CITIZENSHIP_CLASSES) : valueGenerator.string({ length })),
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

  const givenRequestToCreatePartyExternalRatingWithAssignedRatingCodeSucceeds = (assignedRatingCode: string): nock.Scope => {
    return requestToCreatePartyExternalRating({ ...acbsExternalRatingToCreate, AssignedRating: { AssignedRatingCode: assignedRatingCode } }).reply(201);
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

  const givenRequestToFindCustomersByPartyUrnSucceeds = (): void => {
    mdmApi.requestToFindCustomersByPartyUrn(alternateIdentifier).respondsWith(200, customersWithCorporateType);
  };

  const givenRequestToGetFindCustomersByAnyPartyUrnSucceeds = (): void => {
    mdmApi.requestToFindCustomersByAnyPartyUrn().respondsWith(200, customersWithCorporateType);
  };

  const givenAllRequestsSucceed = (): void => {
    givenRequestToGetPartiesBySearchTextSucceeds();
    givenRequestToCreatePartySucceeds();
    givenRequestToGetPartyExternalRatingsSucceeds();
    givenRequestToCreatePartyExternalRatingSucceeds();
    givenRequestToFindCustomersByPartyUrnSucceeds();
  };
});

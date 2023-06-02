import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityInvestorRequest, CreateFacilityInvestorRequestItem } from '@ukef/modules/facility-investor/dto/create-facility-investor-request.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_CURRENCIES } from '@ukef-test/support/constants/test-currency.constant';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';
import supertest from 'supertest';

describe('POST /facilities/{facilityIdentifier}/investors', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.facilityId();
  const createFacilityInvestorUrl = `/api/v1/facilities/${facilityIdentifier}/investors`;

  const {
    facilityStatus: { facilityStatusCode },
    involvedParty: { partyIdentifier: involvedPartyIdentifier },
    sectionIdentifier,
  } = PROPERTIES.FACILITY_INVESTOR.DEFAULT;
  const effectiveDateInFuture = TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY;
  const guaranteeExpiryDateInFuture = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
  const lenderType = valueGenerator.stringOfNumericCharacters({ length: 3 });
  const currency = TEST_CURRENCIES.A_TEST_CURRENCY;
  const maximumLiability = 12345.6;
  const limitTypeCode = valueGenerator.stringOfNumericCharacters({ minLength: 1, maxLength: 2 });
  const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 10 });

  const requestItemToCreateFacilityInvestor: CreateFacilityInvestorRequestItem = {
    effectiveDate: effectiveDateInFuture,
    guaranteeExpiryDate: guaranteeExpiryDateInFuture,
    lenderType,
    currency,
    maximumLiability,
  };

  const requestBodyToCreateFacilityInvestor: CreateFacilityInvestorRequest = [requestItemToCreateFacilityInvestor];

  const acbsRequestBodyToCreateFacilityParty = {
    FacilityStatus: {
      FacilityStatusCode: facilityStatusCode,
    },
    InvolvedParty: {
      PartyIdentifier: involvedPartyIdentifier,
    },
    EffectiveDate: dateStringTransformations.addTimeToDateOnlyString(effectiveDateInFuture),
    ExpirationDate: dateStringTransformations.addTimeToDateOnlyString(guaranteeExpiryDateInFuture),
    LenderType: {
      LenderTypeCode: lenderType,
    },
    SectionIdentifier: sectionIdentifier,
    Currency: {
      CurrencyCode: currency,
    },
    LimitAmount: maximumLiability,
    CustomerAdvisedIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.customerAdvisedIndicator,
    LimitRevolvingIndicator: PROPERTIES.FACILITY_INVESTOR.DEFAULT.limitRevolvingIndicator,
  };

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateFacilityPartyInAcbsSucceeds(),
    makeRequest: () => postForFacilityIdentifier(requestBodyToCreateFacilityInvestor),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityPartyInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth: IncorrectAuthArg) =>
      api.postWithoutAuth(createFacilityInvestorUrl, requestBodyToCreateFacilityInvestor, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('creates a facility party in ACBS and returns a 201 response with the facility identifier if the creation in ACBS is successful', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateFacilityPartyInAcbsSucceeds();

    const { status, body } = await postForFacilityIdentifier(requestBodyToCreateFacilityInvestor);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('creates a facility party in ACBS with a default lenderType if it is not specified in the request', async () => {
    const { lenderType: _removed, ...requestWithoutLenderType } = requestItemToCreateFacilityInvestor;
    const requestBodyWithoutLenderType = [requestWithoutLenderType];
    const acbsRequestBodyWithDefaultLenderTypeCode = {
      ...acbsRequestBodyToCreateFacilityParty,
      LenderType: { LenderTypeCode: PROPERTIES.FACILITY_INVESTOR.DEFAULT.lenderType.lenderTypeCode },
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = requestToCreateFacilityPartyInAcbs({ facilityId: facilityIdentifier, requestBody: acbsRequestBodyWithDefaultLenderTypeCode }).reply(
      ...acbsSuccessResponseForFacilityId(facilityIdentifier),
    );

    const { status, body } = await postForFacilityIdentifier(requestBodyWithoutLenderType);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('returns a 404 response if ACBS responds with a 400 response that is a string containing "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacilityPartyInAcbs().reply(400, 'The facility not found or user does not have access');

    const { status, body } = await postForFacilityIdentifier(requestBodyToCreateFacilityInvestor);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateFacilityPartyInAcbs().reply(400, acbsErrorMessage);

    const { status, body } = await postForFacilityIdentifier(requestBodyToCreateFacilityInvestor);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToCreateFacilityPartyInAcbs().reply(400, acbsErrorMessage);

    const { status, body } = await postForFacilityIdentifier(requestBodyToCreateFacilityInvestor);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacilityPartyInAcbs().reply(401, 'Unauthorized');

    const { status, body } = await postForFacilityIdentifier(requestBodyToCreateFacilityInvestor);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  withFacilityIdentifierUrlValidationApiTests({
    makeRequestWithFacilityId: (facilityId: string) => post({ facilityId, body: requestBodyToCreateFacilityInvestor }),
    givenRequestWouldOtherwiseSucceedForFacilityId: (facilityId: string) => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToCreateFacilityPartyInAcbs({ facilityId, requestBody: acbsRequestBodyToCreateFacilityParty }).reply(
        ...acbsSuccessResponseForFacilityId(facilityId),
      );
    },
    successStatusCode: 201,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateFacilityInvestor,
    makeRequest: (body) => postForFacilityIdentifier(body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody: requestBodyToCreateFacilityInvestor,
    makeRequest: (body) => postForFacilityIdentifier(body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds();
    },
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody: requestBodyToCreateFacilityInvestor,
    makeRequest: (body) => postForFacilityIdentifier(body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds();
    },
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody: requestBodyToCreateFacilityInvestor,
    makeRequest: (body) => postForFacilityIdentifier(body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'lenderType',
    length: 3,
    required: false,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateFacilityInvestor,
    makeRequest: (body) => postForFacilityIdentifier(body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds();
    },
  });

  const postForFacilityIdentifier = (body: object): supertest.Test => post({ facilityId: facilityIdentifier, body });

  const post = ({ facilityId, body }: { facilityId: string; body: object }): supertest.Test => {
    const url = `/api/v1/facilities/${facilityId}/investors`;
    return api.post(url, body);
  };

  const givenRequestToCreateFacilityPartyInAcbsSucceeds = (): nock.Scope =>
    requestToCreateFacilityPartyInAcbs().reply(...acbsSuccessResponseForFacilityId(facilityIdentifier));

  const requestToCreateFacilityPartyInAcbs = (
    { facilityId, requestBody }: { facilityId: string; requestBody: nock.RequestBodyMatcher } = {
      facilityId: facilityIdentifier,
      requestBody: acbsRequestBodyToCreateFacilityParty,
    },
  ): nock.Interceptor => {
    return nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/FacilityParty`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`);
  };

  const givenAnyRequestBodyToCreateFacilityInvestorInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityParty`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(...acbsSuccessResponseForFacilityId(facilityIdentifier));
  };

  const acbsSuccessResponseForFacilityId = (facilityId: string): [number, undefined, { location: string }] => [
    201,
    undefined,
    {
      location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityId}/FacilityParty?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderType}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}`,
    },
  ];
});

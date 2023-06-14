import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /deals/{dealIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const dealIdentifier = valueGenerator.ukefId();
  const createDealGuaranteeUrl = `/api/v1/deals/${dealIdentifier}/guarantees`;

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const {
    guaranteedPercentage,
    lenderType: { lenderTypeCode },
    limitType: { limitTypeCode },
    sectionIdentifier,
  } = PROPERTIES.DEAL_GUARANTEE.DEFAULT;

  const guarantorParty = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const limitKey = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const effectiveDateInPast = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
  const guaranteeExpiryDateInFuture = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
  const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ length: 3 });
  const maximumLiability = 12345.6;

  const acbsRequestBodyToCreateDealGuarantee = {
    LenderType: {
      LenderTypeCode: lenderTypeCode,
    },
    SectionIdentifier: sectionIdentifier,
    LimitType: {
      LimitTypeCode: limitTypeCode,
    },
    LimitKey: limitKey,
    GuarantorParty: {
      PartyIdentifier: guarantorParty,
    },
    GuaranteeType: {
      GuaranteeTypeCode: guaranteeTypeCode,
    },
    EffectiveDate: dateStringTransformations.addTimeToDateOnlyString(effectiveDateInPast),
    ExpirationDate: dateStringTransformations.addTimeToDateOnlyString(guaranteeExpiryDateInFuture),
    GuaranteedLimit: 12345.6,
    GuaranteedPercentage: guaranteedPercentage,
  };

  const requestItemToCreateDealGuarantee = {
    dealIdentifier,
    guarantorParty,
    limitKey,
    effectiveDate: effectiveDateInPast,
    guaranteeExpiryDate: guaranteeExpiryDateInFuture,
    maximumLiability,
    guaranteeTypeCode,
  };

  const requestBodyToCreateDealGuarantee = [requestItemToCreateDealGuarantee];

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateDealGuaranteeInAcbsSucceeds(),
    makeRequest: () => api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateDealGuaranteeInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the deal guarantee location if it has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateDealGuaranteeInAcbsSucceeds();

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('sets the default guarantorParty if it is not specified in the request', async () => {
    const { guarantorParty: _removed, ...newDealGuaranteeWithoutGuarantorParty } = requestItemToCreateDealGuarantee;
    const requestBodyWithoutGuarantorParty = [newDealGuaranteeWithoutGuarantorParty];
    const acbsRequestBodyWithDefaultGuarantorParty = {
      ...acbsRequestBodyToCreateDealGuarantee,
      GuarantorParty: { PartyIdentifier: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guarantorParty },
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithDefaultGuarantorParty = requestToCreateDealGuaranteeInAcbsWithBody(acbsRequestBodyWithDefaultGuarantorParty).reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyWithoutGuarantorParty);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithDefaultGuarantorParty.isDone()).toBe(true);
  });

  it('sets the default guaranteeTypeCode if it is not specified in the request', async () => {
    const { guaranteeTypeCode: _removed, ...newDealGuaranteeWithoutGuaranteeTypeCode } = requestItemToCreateDealGuarantee;
    const requestBodyWithoutGuaranteeTypeCode = [newDealGuaranteeWithoutGuaranteeTypeCode];
    const acbsRequestBodyWithDefaultGuaranteeTypeCode = {
      ...acbsRequestBodyToCreateDealGuarantee,
      GuaranteeType: {
        GuaranteeTypeCode: PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteeTypeCode,
      },
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithDefaultGuaranteeTypeCode = requestToCreateDealGuaranteeInAcbsWithBody(acbsRequestBodyWithDefaultGuaranteeTypeCode).reply(
      201,
      undefined,
      {
        location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
      },
    );

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyWithoutGuaranteeTypeCode);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithDefaultGuaranteeTypeCode.isDone()).toBe(true);
  });

  it('rounds the maximumLiability to 2dp', async () => {
    const requestBodyWithMaximumLiabilityToRound = [{ ...requestBodyToCreateDealGuarantee[0], maximumLiability: 1.234 }];
    const acbsRequestBodyWithRoundedMaximumLiability = {
      ...acbsRequestBodyToCreateDealGuarantee,
      GuaranteedLimit: 1.23,
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithRoundedMaximumLiability = requestToCreateDealGuaranteeInAcbsWithBody(acbsRequestBodyWithRoundedMaximumLiability).reply(
      201,
      undefined,
      {
        location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
      },
    );

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyWithMaximumLiabilityToRound);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithRoundedMaximumLiability.isDone()).toBe(true);
  });

  it(`replaces the effectiveDate with today's date if the specified effectiveDate is after today`, async () => {
    const requestBodyWithFutureEffectiveDate = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: TEST_DATES.A_FUTURE_EFFECTIVE_DATE_ONLY }];
    const acbsRequestBodyWithTodayEffectiveDate = {
      ...acbsRequestBodyToCreateDealGuarantee,
      EffectiveDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithTodayEffectiveDate = requestToCreateDealGuaranteeInAcbsWithBody(acbsRequestBodyWithTodayEffectiveDate).reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyWithFutureEffectiveDate);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
    expect(acbsRequestWithTodayEffectiveDate.isDone()).toBe(true);
  });

  withStringFieldValidationApiTests({
    fieldName: 'limitKey',
    length: 8,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'guarantorParty',
    length: 8,
    required: false,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'guaranteeTypeCode',
    length: 3,
    required: false,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateDealGuarantee,
    makeRequest: (body) => api.post(createDealGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();
    },
  });

  it('returns a 404 response if ACBS responds with a 400 response that is a string containing "The deal not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealGuarantee().reply(400, 'The deal not found or user does not have access');

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateDealGuarantee().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "The deal not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToCreateDealGuarantee().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateDealGuarantee().reply(401, 'Unauthorized');

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  const givenRequestToCreateDealGuaranteeInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateDealGuarantee().reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });
  };

  const requestToCreateDealGuarantee = (): nock.Interceptor => requestToCreateDealGuaranteeInAcbsWithBody(acbsRequestBodyToCreateDealGuarantee);

  const requestToCreateDealGuaranteeInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, {
        location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
      });
  };
});

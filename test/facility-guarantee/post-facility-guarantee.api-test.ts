import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withRequiredNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/required-non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { TEST_DATES } from '@ukef-test/support/constants/test-date.constant';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();

  const facilityIdentifier = valueGenerator.facilityId();
  const createFacilityGuaranteeUrl = `/api/v1/facilities/${facilityIdentifier}/guarantees`;

  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const lenderTypeCode = PROPERTIES.FACILITY_GUARANTEE.DEFAULT.lenderType.lenderTypeCode;
  const limitTypeCode = PROPERTIES.FACILITY_GUARANTEE.DEFAULT.limitType.limitTypeCode;
  const sectionIdentifier = PROPERTIES.FACILITY_GUARANTEE.DEFAULT.sectionIdentifier;
  const guaranteedPercentage = PROPERTIES.FACILITY_GUARANTEE.DEFAULT.guaranteedPercentage;

  const guarantorParty = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const limitKey = valueGenerator.stringOfNumericCharacters({ length: 8 });
  const effectiveDateInPast = TEST_DATES.A_PAST_EFFECTIVE_DATE_ONLY;
  const guaranteeExpiryDateInFuture = TEST_DATES.A_FUTURE_EXPIRY_DATE_ONLY;
  const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters({ length: 3 });
  const maximumLiability = 12345.6;

  const acbsRequestBodyToCreateFacilityGuarantee = {
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

  const requestBodyToCreateFacilityGuarantee = [
    {
      facilityIdentifier,
      guarantorParty,
      limitKey,
      effectiveDate: effectiveDateInPast,
      guaranteeExpiryDate: guaranteeExpiryDateInFuture,
      maximumLiability,
      guaranteeTypeCode,
    },
  ];

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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateFacilityGuaranteeInAcbsSucceeds(),
    makeRequest: () => api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityGuaranteeInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the facility guarantee location if it has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequest = givenRequestToCreateFacilityGuaranteeInAcbsSucceeds();

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  it('rounds the maximumLiability to 2dp', async () => {
    const requestBodyWithMaximumLiabilityToRound = [{ ...requestBodyToCreateFacilityGuarantee[0], maximumLiability: 1.234 }];
    const acbsRequestBodyWithRoundedMaximumLiability = {
      ...acbsRequestBodyToCreateFacilityGuarantee,
      GuaranteedLimit: 1.23,
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithRoundedMaximumLiability = requestToCreateFacilityGuaranteeInAcbsWithBody(acbsRequestBodyWithRoundedMaximumLiability).reply(
      201,
      undefined,
      {
        location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
      },
    );

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyWithMaximumLiabilityToRound);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequestWithRoundedMaximumLiability.isDone()).toBe(true);
  });

  it(`replaces the effectiveDate with today's date if the specified effectiveDate is in future`, async () => {
    const requestBodyWithFutureEffectiveDate = [{ ...requestBodyToCreateFacilityGuarantee[0], effectiveDate: '3000-01-02' }];
    const acbsRequestBodyWithTodayEffectiveDate = {
      ...acbsRequestBodyToCreateFacilityGuarantee,
      EffectiveDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    };
    givenAuthenticationWithTheIdpSucceeds();
    const acbsRequestWithTodayEffectiveDate = requestToCreateFacilityGuaranteeInAcbsWithBody(acbsRequestBodyWithTodayEffectiveDate).reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyWithFutureEffectiveDate);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequestWithTodayEffectiveDate.isDone()).toBe(true);
  });

  withStringFieldValidationApiTests({
    fieldName: 'facilityIdentifier',
    length: 10,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.facilityId(length - 4),
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'limitKey',
    length: 8,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withRequiredNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'guarantorParty',
    length: 8,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  withStringFieldValidationApiTests({
    fieldName: 'guaranteeTypeCode',
    length: 3,
    required: true,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody: requestBodyToCreateFacilityGuarantee,
    makeRequest: (body) => api.post(createFacilityGuaranteeUrl, body),
    givenAnyRequestBodyWouldSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds();
    },
  });

  it('returns a 404 response if ACBS responds with a 400 response that is a string containing "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacilityGuarantee().reply(400, 'The facility not found or user does not have access');

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee);

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is not a string', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = { Message: 'error message' };
    requestToCreateFacilityGuarantee().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: JSON.stringify(acbsErrorMessage), statusCode: 400 });
  });

  it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "The facility not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    const acbsErrorMessage = 'ACBS error message';
    requestToCreateFacilityGuarantee().reply(400, acbsErrorMessage);

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee);

    expect(status).toBe(400);
    expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
  });

  it('returns a 500 response if ACBS responds with an error code that is not 400"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToCreateFacilityGuarantee().reply(401, 'Unauthorized');

    const { status, body } = await api.post(createFacilityGuaranteeUrl, requestBodyToCreateFacilityGuarantee);

    expect(status).toBe(500);
    expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
  });

  const givenRequestToCreateFacilityGuaranteeInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityGuarantee().reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });
  };

  const requestToCreateFacilityGuarantee = (): nock.Interceptor => requestToCreateFacilityGuaranteeInAcbsWithBody(acbsRequestBodyToCreateFacilityGuarantee);

  const requestToCreateFacilityGuaranteeInAcbsWithBody = (requestBody: nock.RequestBodyMatcher): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, requestBody)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenAnyRequestBodyToCreateFacilityGuaranteeInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201, undefined, {
        location: `/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/FacilityGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
      });
  };
});

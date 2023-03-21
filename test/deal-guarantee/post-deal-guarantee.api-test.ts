import { PROPERTIES } from '@ukef/constants';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /deals/{dealIdentifier}/guarantees', () => {
  const valueGenerator = new RandomValueGenerator();

  const dealIdentifier = valueGenerator.stringOfNumericCharacters({ maxLength: 10 });
  const createDealGuaranteeUrl = `/api/v1/deals/${dealIdentifier}/guarantees`;

  const portfolioIdentifier = PROPERTIES.GLOBAL.portfolioIdentifier;
  const lenderTypeCode = PROPERTIES.DEAL_GUARANTEE.DEFAULT.lenderType.lenderTypeCode;
  const limitTypeCode = PROPERTIES.DEAL_GUARANTEE.DEFAULT.limitType.limitTypeCode;
  const sectionIdentifier = PROPERTIES.DEAL_GUARANTEE.DEFAULT.sectionIdentifier;
  const guaranteedPercentage = PROPERTIES.DEAL_GUARANTEE.DEFAULT.guaranteedPercentage;

  const guarantorParty = valueGenerator.stringOfNumericCharacters({ maxLength: 10 });
  const limitKey = valueGenerator.stringOfNumericCharacters({ maxLength: 10 });
  const effectiveDateInFuture = '9999-01-02';
  const guaranteeExpiryDateInFuture = '9999-12-31';
  const guaranteeTypeCode = valueGenerator.stringOfNumericCharacters();
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
    EffectiveDate: effectiveDateInFuture + 'T00:00:00Z',
    ExpirationDate: guaranteeExpiryDateInFuture + 'T00:00:00Z',
    GuaranteedLimit: 12345.6,
    GuaranteedPercentage: guaranteedPercentage,
  };

  const requestBodyToCreateDealGuarantee = [
    {
      dealIdentifier,
      guarantorParty,
      limitKey,
      effectiveDate: effectiveDateInFuture,
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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToCreateDealGuaranteeInAcbsSucceeds(),
    makeRequest: () => api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee),
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
    givenRequestToCreateDealGuaranteeInAcbsSucceeds();

    const { status, body } = await api.post(createDealGuaranteeUrl, requestBodyToCreateDealGuarantee);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      dealIdentifier,
    });
  });

  describe('dealIdentifier validation', () => {
    it('returns a 400 response if the dealIdentifier in the request body is not present', async () => {
      const { dealIdentifier: _removed, ...requestWithoutDealIdentifier } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutDealIdentifier]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['dealIdentifier must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the dealIdentifier is an empty string', async () => {
      const requestWithEmptyDealIdentifier = [{ ...requestBodyToCreateDealGuarantee[0], dealIdentifier: '' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEmptyDealIdentifier);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['dealIdentifier must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the dealIdentifier is over 10 characters', async () => {
      const requestWithTooLongDealIdentifier = [{ ...requestBodyToCreateDealGuarantee[0], dealIdentifier: '12345678901' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithTooLongDealIdentifier);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['dealIdentifier must be shorter than or equal to 10 characters'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if the dealIdentifier is at most 10 characters', async () => {
      const requestWithTenCharacterDealIdentifier = [{ ...requestBodyToCreateDealGuarantee[0], dealIdentifier: '1234567890' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithTenCharacterDealIdentifier);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('limitKey validation', () => {
    it('returns a 400 response if the limitKey in the request body is not present', async () => {
      const { limitKey: _removed, ...requestWithoutLimitKey } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutLimitKey]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['limitKey must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the limitKey is an empty string', async () => {
      const requestWithEmptyLimitKey = [{ ...requestBodyToCreateDealGuarantee[0], limitKey: '' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEmptyLimitKey);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['limitKey must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the limitKey is over 10 characters', async () => {
      const requestWithTooLongLimitKey = [{ ...requestBodyToCreateDealGuarantee[0], limitKey: '12345678901' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithTooLongLimitKey);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['limitKey must be shorter than or equal to 10 characters'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if the limitKey is at most 10 characters', async () => {
      const requestWithTenCharacterLimitKey = [{ ...requestBodyToCreateDealGuarantee[0], limitKey: '1234567890' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithTenCharacterLimitKey);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('effectiveDate validation', () => {
    it('returns a 400 response if the effectiveDate is not present', async () => {
      const { effectiveDate: _removed, ...requestWithoutEffectiveDate } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutEffectiveDate]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['effectiveDate must be a valid ISO 8601 date string', `effectiveDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the effectiveDate has time part of date string', async () => {
      const requestWithEffectiveDateInIncorrectFormat = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: '2023-02-01T00:00:00Z' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEffectiveDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`effectiveDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the effectiveDate is not in YYYY-MM-DD date format', async () => {
      const requestWithEffectiveDateInIncorrectFormat = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: '20230201' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEffectiveDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`effectiveDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the effectiveDate is not a valid date', async () => {
      const requestWithEffectiveDateAsInvalidDate = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: '2023-99-10' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEffectiveDateAsInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['effectiveDate must be a valid ISO 8601 date string'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the effectiveDate is not a real day', async () => {
      const requestWithEffectiveDateAsInvalidDate = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: '2019-02-29' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEffectiveDateAsInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['effectiveDate must be a valid ISO 8601 date string'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if the effectiveDate is a valid date', async () => {
      const requestWithValidEffectiveDate = [{ ...requestBodyToCreateDealGuarantee[0], effectiveDate: '2022-02-01' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithValidEffectiveDate);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('guaranteeExpiryDate validation', () => {
    it('returns a 400 response if the guaranteeExpiryDate is not present', async () => {
      const { guaranteeExpiryDate: _removed, ...requestWithoutGuaranteeExpiryDate } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutGuaranteeExpiryDate]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guaranteeExpiryDate must be a valid ISO 8601 date string', `guaranteeExpiryDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the guaranteeExpiryDate has time part of date string', async () => {
      const requestWithGuaranteeExpiryDateInIncorrectFormat = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeExpiryDate: '2023-02-01T00:00:00Z' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuaranteeExpiryDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`guaranteeExpiryDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the guaranteeExpiryDate is not in YYYY-MM-DD date format', async () => {
      const requestWithGuaranteeExpiryDateInIncorrectFormat = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeExpiryDate: '20230201' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuaranteeExpiryDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`guaranteeExpiryDate must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the guaranteeExpiryDate is not a valid date', async () => {
      const requestWithGuaranteeExpiryDateAsInvalidDate = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeExpiryDate: '2023-99-10' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuaranteeExpiryDateAsInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guaranteeExpiryDate must be a valid ISO 8601 date string'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the guaranteeExpiryDate is not a real day', async () => {
      const requestWithGuaranteeExpiryDateAsInvalidDate = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeExpiryDate: '2019-02-29' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuaranteeExpiryDateAsInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guaranteeExpiryDate must be a valid ISO 8601 date string'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if the guaranteeExpiryDate is a valid date', async () => {
      const requestWithValidGuaranteeExpiryDate = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeExpiryDate: '2022-02-01' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithValidGuaranteeExpiryDate);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('maximumLiability validation', () => {
    it('returns a 400 response if the maximumLiability is not present', async () => {
      const { maximumLiability: _removed, ...requestWithoutMaximumLiability } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutMaximumLiability]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['maximumLiability must not be less than 0', 'maximumLiability should not be empty'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if the maximumLiability is less than 0', async () => {
      const requestWithNegativeMaximumLiability = [{ ...requestBodyToCreateDealGuarantee[0], maximumLiability: -0.01 }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithNegativeMaximumLiability);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['maximumLiability must not be less than 0'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if the maximumLiability is 0', async () => {
      const requestWithZeroMaximumLiability = [{ ...requestBodyToCreateDealGuarantee[0], maximumLiability: 0 }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithZeroMaximumLiability);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('guarantorParty validation', () => {
    it('returns a 201 response if guarantorParty is not present', async () => {
      const { guarantorParty: _removed, ...requestWithoutGuarantorTypeCode } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutGuarantorTypeCode]);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });

    it('returns a 201 response if guarantorParty is present', async () => {
      const requestWithGuarantorParty = [{ ...requestBodyToCreateDealGuarantee[0], guarantorParty: '001' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuarantorParty);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });

    it('returns a 400 response if guarantorParty is more than 10 characters', async () => {
      const requestWithTooLongGuarantorParty = [{ ...requestBodyToCreateDealGuarantee[0], guarantorParty: '12345678901' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithTooLongGuarantorParty);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guarantorParty must be shorter than or equal to 10 characters'],
        statusCode: 400,
      });
    });

    it('returns a 400 response if guarantorParty is empty', async () => {
      const requestWithEmptyGuarantorParty = [{ ...requestBodyToCreateDealGuarantee[0], guarantorParty: '' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEmptyGuarantorParty);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guarantorParty must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });

    it('returns a 201 response if guarantorParty is at least 1 character', async () => {
      const requestWithGuarantorPartyOfLength1 = [{ ...requestBodyToCreateDealGuarantee[0], guarantorParty: '1' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuarantorPartyOfLength1);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });

    it('returns a 201 response if guarantorParty is at most 10 characters', async () => {
      const requestWithGuarantorPartyOfLength10 = [{ ...requestBodyToCreateDealGuarantee[0], guarantorParty: '1234567890' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuarantorPartyOfLength10);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });
  });

  describe('guaranteeTypeCode validation', () => {
    it('returns a 201 response if guaranteeTypeCode is not present', async () => {
      const { guaranteeTypeCode: _removed, ...requestWithoutGuaranteeTypeCode } = requestBodyToCreateDealGuarantee[0];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, [requestWithoutGuaranteeTypeCode]);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });

    it('returns a 201 response if guaranteeTypeCode is present', async () => {
      const requestWithGuaranteeTypeCode = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeTypeCode: '001' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithGuaranteeTypeCode);

      expect(status).toBe(201);
      expect(body).toStrictEqual({ dealIdentifier });
    });

    it('returns a 400 response if guaranteeTypeCode is empty', async () => {
      const requestWithEmptyGuaranteeTypeCode = [{ ...requestBodyToCreateDealGuarantee[0], guaranteeTypeCode: '' }];
      givenAuthenticationWithTheIdpSucceeds();
      givenAnyRequestBodyToCreateDealGuaranteeInAcbsSucceeds();

      const { status, body } = await api.post(createDealGuaranteeUrl, requestWithEmptyGuaranteeTypeCode);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: ['guaranteeTypeCode must be longer than or equal to 1 characters'],
        statusCode: 400,
      });
    });
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

  // TODO APIM-73: Should we test defaults are set in the API tests also?

  const givenRequestToCreateDealGuaranteeInAcbsSucceeds = (): void => {
    requestToCreateDealGuarantee().reply(201, undefined, {
      location: `/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee?accountOwnerIdentifier=00000000&lenderTypeCode=${lenderTypeCode}&sectionIdentifier=${sectionIdentifier}&limitTypeCode=${limitTypeCode}&limitKey=${limitKey}&guarantorPartyIdentifier=${guarantorParty}`,
    });
  };

  const requestToCreateDealGuarantee = (): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Deal/${dealIdentifier}/DealGuarantee`, acbsRequestBodyToCreateDealGuarantee)
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

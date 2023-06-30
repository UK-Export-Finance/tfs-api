import { ENUMS, PROPERTIES } from '@ukef/constants';
import { LenderTypeCodeEnum } from '@ukef/constants/enums/lender-type-code';
import { AcbsPartyId } from '@ukef/helpers';
import { AcbsCreateFacilityFixedFeeRequestDto } from '@ukef/modules/acbs/dto/acbs-create-facility-fixed-fee-request.dto';
import { AcbsGetFacilityResponseDto } from '@ukef/modules/acbs/dto/acbs-get-facility-response.dto';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { CreateFacilityFixedFeeRequest } from '@ukef/modules/facility-fixed-fee/dto/create-facility-fixed-fee-request.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withRequiredBooleanFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/boolean-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { CreateFacilityFixedFeeGenerator } from '@ukef-test/support/generator/create-facility-fixed-fee-generator';
import { GetFacilityGenerator } from '@ukef-test/support/generator/get-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('POST /facilities/{facilityIdentifier}/fixed-fees', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.facilityId();
  const createFacilityFixedFeeUrl = `/api/v1/facilities/${facilityIdentifier}/fixed-fees`;
  const facilityTypeCode = valueGenerator.enumValue(ENUMS.FACILITY_TYPE_IDS);
  const borrowerPartyIdentifier = valueGenerator.acbsPartyId();

  const { portfolioIdentifier } = PROPERTIES.GLOBAL;

  const { facilitiesInAcbs } = new GetFacilityGenerator(valueGenerator, dateStringTransformations).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
  });
  const facilityInAcbs: AcbsGetFacilityResponseDto = {
    ...facilitiesInAcbs[0],
    FacilityType: { FacilityTypeCode: facilityTypeCode },
    BorrowerParty: { PartyIdentifier: borrowerPartyIdentifier, PartyName1: valueGenerator.string() },
    FacilityUserDefinedList1: { FacilityUserDefinedList1Code: ENUMS.FACILITY_STAGES.ISSUED },
    FacilityOverallStatus: { FacilityStatusCode: ENUMS.FACILITY_STATUSES.ACTIVE },
  };

  const { acbsRequestBodyToCreateFacilityFixedFee, requestBodyToCreateFacilityFixedFee } = new CreateFacilityFixedFeeGenerator(
    valueGenerator,
    new DateStringTransformations(),
  ).generate({
    numberToGenerate: 1,
    facilityTypeCode,
    borrowerPartyIdentifier,
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
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenRequestToCreateFacilityFixedFeeInAcbsSucceeds();
    },
    makeRequest: () => api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee),
    successStatusCode: 201,
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenRequestToCreateFacilityFixedFeeInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 201 response with the facility identifier if getting the facility succeeds and the facility fixedFee has been successfully created in ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityFromAcbsSucceeds();
    const acbsRequest = givenRequestToCreateFacilityFixedFeeInAcbsSucceeds();

    const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

    expect(status).toBe(201);
    expect(body).toStrictEqual({
      facilityIdentifier,
    });
    expect(acbsRequest.isDone()).toBe(true);
  });

  describe('Facility state checks', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('returns a 400 response if ACBS respond with Facility status that is not A', async () => {
      const facilityNotActive: AcbsGetFacilityResponseDto = {
        ...facilityInAcbs,
        FacilityOverallStatus: { FacilityStatusCode: 'D' },
      };
      givenRequestToGetFacilityFromAcbsSucceedsReturning(facilityNotActive);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: 'Facility needs to be activated before a fixed fee is created', statusCode: 400 });
    });

    it('returns a 400 response if ACBS respond with Facility stage that is not issued', async () => {
      const facilityNotIssued: AcbsGetFacilityResponseDto = {
        ...facilityInAcbs,
        FacilityUserDefinedList1: { FacilityUserDefinedList1Code: '06' },
      };
      givenRequestToGetFacilityFromAcbsSucceedsReturning(facilityNotIssued);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: 'Facility needs to be issued before a fixed fee is created', statusCode: 400 });
    });
  });

  describe('InvolvedParty mapping', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
    });

    it('sets InvolvedParty to ECGD default party id if lenderTypeCode is ECGD', async () => {
      givenRequestToGetFacilityFromAcbsSucceeds();
      const facilityFixedlenderTypeCodeECGD: CreateFacilityFixedFeeRequest = [
        {
          ...requestBodyToCreateFacilityFixedFee[0],
          lenderTypeCode: ENUMS.LENDER_TYPE_CODES.ECGD,
        },
      ];
      const acbsRequestBodyWithExpectedInvolvedParty = {
        ...acbsRequestBodyToCreateFacilityFixedFee,
        LenderType: { LenderTypeCode: ENUMS.LENDER_TYPE_CODES.ECGD },
        InvolvedParty: { PartyIdentifier: PROPERTIES.FACILITY_FIXED_FEE.DEFAULT.involvedParty.partyIdentifier as AcbsPartyId },
      };
      const acbsRequestWithExpectedInvolvedParty = requestToCreateFacilityFixedFeeInAcbsWithBody(acbsRequestBodyWithExpectedInvolvedParty).reply(201);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, facilityFixedlenderTypeCodeECGD);

      expect(status).toBe(201);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expect(acbsRequestWithExpectedInvolvedParty.isDone()).toBe(true);
    });

    it('sets InvolvedParty to borrowerPartyIdentifier if lenderTypeCode is FIRST_LEVEL_OBLIGOR', async () => {
      givenRequestToGetFacilityFromAcbsSucceeds();
      const facilityFixedlenderTypeCodeFirstLevelObligor: CreateFacilityFixedFeeRequest = [
        {
          ...requestBodyToCreateFacilityFixedFee[0],
          lenderTypeCode: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR,
        },
      ];
      const acbsRequestBodyWithExpectedInvolvedParty = {
        ...acbsRequestBodyToCreateFacilityFixedFee,
        LenderType: { LenderTypeCode: ENUMS.LENDER_TYPE_CODES.FIRST_LEVEL_OBLIGOR },
        InvolvedParty: { PartyIdentifier: borrowerPartyIdentifier },
      };
      const acbsRequestWithExpectedInvolvedParty = requestToCreateFacilityFixedFeeInAcbsWithBody(acbsRequestBodyWithExpectedInvolvedParty).reply(201);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, facilityFixedlenderTypeCodeFirstLevelObligor);

      expect(status).toBe(201);
      expect(body).toStrictEqual({
        facilityIdentifier,
      });
      expect(acbsRequestWithExpectedInvolvedParty.isDone()).toBe(true);
    });
  });

  describe('error cases when getting the facility', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToCreateFacilityFixedFeeInAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Facility not found" when getting the facility', async () => {
      requestToGetFacility().reply(400, 'Facility not found or the user does not have access to it');

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is not a string when getting the facility', async () => {
      const acbsErrorMessage = { Message: 'error message' };
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with a 400 response that is a string that does not contain "Facility not found" when getting the facility', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToGetFacility().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when getting the facility', async () => {
      requestToGetFacility().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when getting the facility', async () => {
      requestToGetFacility().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, facilityInAcbs);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('error cases when creating the facility fixedFee', () => {
    beforeEach(() => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
    });

    it('returns a 404 response if ACBS responds with a 400 response that is a string containing "Invalid PortfolioId and FacilityId combination." when creating the facility fixedFee', async () => {
      requestToCreateFacilityFixedFee().reply(400, 'Invalid PortfolioId and FacilityId combination.');

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(404);
      expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string containing "FixedFee exists." when creating the facility fixedFee', async () => {
      requestToCreateFacilityFixedFee().reply(400, 'FixedFee exists');

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad request',
        statusCode: 400,
        error: 'Fixed fee with this period and lenderTypeCode combination already exists.',
      });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is not a string when creating the facility fixedFee', async () => {
      const acbsErrorMessage = JSON.stringify({ Message: 'error message' });
      requestToCreateFacilityFixedFee().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 400 response if ACBS responds with a 400 response that is a string that does not contain "Invalid PortfolioId and FacilityId combination." or "FixedFee exists" when creating the facility fixedFee', async () => {
      const acbsErrorMessage = 'ACBS error message';
      requestToCreateFacilityFixedFee().reply(400, acbsErrorMessage);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(400);
      expect(body).toStrictEqual({ message: 'Bad request', error: acbsErrorMessage, statusCode: 400 });
    });

    it('returns a 500 response if ACBS responds with an error code that is not 400 when creating the facility fixedFee', async () => {
      requestToCreateFacilityFixedFee().reply(401, 'Unauthorized');

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({ message: 'Internal server error', statusCode: 500 });
    });

    it('returns a 500 response if ACBS times out when creating the facility fixedFee', async () => {
      requestToCreateFacilityFixedFee().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(201);

      const { status, body } = await api.post(createFacilityFixedFeeUrl, requestBodyToCreateFacilityFixedFee);

      expect(status).toBe(500);
      expect(body).toStrictEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(createFacilityFixedFeeUrl, body);
    const givenAnyRequestBodyWouldSucceed = () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityFromAcbsSucceeds();
      givenAnyrequestBodyToCreateFacilityFixedFeeInAcbsSucceeds();
    };

    withNonNegativeNumberFieldValidationApiTests({
      fieldName: 'amount',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'effectiveDate',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'expirationDate',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'nextDueDate',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withDateOnlyFieldValidationApiTests({
      fieldName: 'nextAccrueToDate',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'period',
      length: 2,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'currency',
      length: 3,
      generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'lenderTypeCode',
      enum: ENUMS.LENDER_TYPE_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => '123' as LenderTypeCodeEnum,
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withStringFieldValidationApiTests({
      fieldName: 'incomeClassCode',
      required: false,
      enum: ENUMS.INCOME_CLASS_CODES,
      generateFieldValueThatDoesNotMatchEnum: () => '123',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    withRequiredBooleanFieldValidationApiTests({
      fieldName: 'spreadToInvestorsIndicator',
      validRequestBody: requestBodyToCreateFacilityFixedFee,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  const givenRequestToGetFacilityFromAcbsSucceeds = (): nock.Scope => givenRequestToGetFacilityFromAcbsSucceedsReturning(facilityInAcbs);

  const givenRequestToGetFacilityFromAcbsSucceedsReturning = (acbsFacility: AcbsGetFacilityResponseDto): nock.Scope => {
    return requestToGetFacility().reply(200, acbsFacility);
  };

  const requestToGetFacility = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .get(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}`)
      .matchHeader('authorization', `Bearer ${idToken}`);

  const givenRequestToCreateFacilityFixedFeeInAcbsSucceeds = (): nock.Scope => {
    return requestToCreateFacilityFixedFee().reply(201);
  };

  const requestToCreateFacilityFixedFee = (): nock.Interceptor => requestToCreateFacilityFixedFeeInAcbsWithBody(acbsRequestBodyToCreateFacilityFixedFee);

  const requestToCreateFacilityFixedFeeInAcbsWithBody = (requestBody: AcbsCreateFacilityFixedFeeRequestDto): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee/FixedFee`, JSON.stringify(requestBody))
      .matchHeader('authorization', `Bearer ${idToken}`)
      .matchHeader('Content-Type', 'application/json');

  const givenAnyrequestBodyToCreateFacilityFixedFeeInAcbsSucceeds = (): void => {
    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Portfolio/${portfolioIdentifier}/Facility/${facilityIdentifier}/Fee/FixedFee`, requestBodyPlaceholder)
      .matchHeader('authorization', `Bearer ${idToken}`)
      .reply(201);
  };
});

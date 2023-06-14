import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseDto } from '@ukef/modules/facility-loan-transaction/dto/get-facility-loan-transaction-response.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withBundleIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/bundle-identifier-url-validation-api-tests';
import { withFacilityIdentifierUrlValidationApiTests } from '@ukef-test/common-tests/request-url-param-validation-api-tests/facility-identifier-url-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/loan-transactions/{bundleIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const facilityIdentifier = valueGenerator.ukefId();
  const bundleIdentifier = valueGenerator.acbsBundleId();

  const getGetFacilityLoanTransactionUrl = (facilityId: string, bundleId: string) => `/api/v1/facilities/${facilityId}/loan-transactions/${bundleId}`;

  const getFacilityLoanTransactionUrl = getGetFacilityLoanTransactionUrl(facilityIdentifier, bundleIdentifier);

  const { acbsFacilityLoanTransaction, apiFacilityLoanTransaction: expectedLoanTransaction } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
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
    givenRequestWouldOtherwiseSucceed: () => givenRequestToGetFacilityLoanTransactionInAcbsSucceeds(),
    makeRequest: () => api.get(getFacilityLoanTransactionUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      givenRequestToGetFacilityLoanTransactionInAcbsSucceeds();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getFacilityLoanTransactionUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    givenRequestToGetFacilityLoanTransactionInAcbsSucceeds();

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransaction)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and DealCustomerUsageRate is null', async () => {
    const loanTransactionInAcbsWithNullDealCustomerUsageRate = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNullDealCustomerUsageRate.BundleMessageList[0].DealCustomerUsageRate = null;
    const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      dealCustomerUsageRate: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNullDealCustomerUsageRate);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNullValue)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and OperationTypeCode is null', async () => {
    const loanTransactionInAcbsWithNullOperationTypeCode = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNullOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = null;
    const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      dealCustomerUsageOperationType: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNullOperationTypeCode);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNullValue)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and OperationTypeCode is empty', async () => {
    const loanTransactionInAcbsWithEmptyOperationTypeCode = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithEmptyOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = '';
    const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      dealCustomerUsageOperationType: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithEmptyOperationTypeCode);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNullValue)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has more than one accrual with the category code 'PAC01'`, async () => {
    const loanTransactionInAcbsWithMoreThanOnePacAccrual = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithMoreThanOnePacAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.FACILITY_LOAN.DEFAULT.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
      },
      SpreadRate: 0,
      YearBasis: {
        YearBasisCode: '',
      },
      IndexRateChangeFrequency: {
        IndexRateChangeFrequencyCode: '',
      },
    });
    const expectedLoanTransactionWithAdditionalAccrual: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      spreadRate: 0,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithMoreThanOnePacAccrual);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithAdditionalAccrual)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has more than one accrual with the category code 'CTL01'`, async () => {
    const loanTransactionInAcbsWithMoreThanOneCtlAccrual = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, loanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList[2]);

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithMoreThanOneCtlAccrual);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransaction)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has no accruals with the category code 'PAC01'`, async () => {
    const loanTransactionInAcbsWithNoPacAccruals = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNoPacAccruals.BundleMessageList[0].AccrualScheduleList.splice(1, 1);
    const expectedLoanTransactionWithNoPacAccruals: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      spreadRate: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNoPacAccruals);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNoPacAccruals)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has no accruals with the category code 'CTL01'`, async () => {
    const loanTransactionInAcbsWithNoCtlAccruals = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNoCtlAccruals.BundleMessageList[0].AccrualScheduleList.splice(2, 1);
    const expectedLoanTransactionWithNoCtlAccruals: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      spreadRateCTL: null,
      indexRateChangeFrequency: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNoCtlAccruals);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNoCtlAccruals)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has no accruals`, async () => {
    const loanTransactionInAcbsWithNoAccruals = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNoAccruals.BundleMessageList[0].AccrualScheduleList = [];
    const expectedLoanTransactionWithNoAccruals: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      spreadRate: null,
      spreadRateCTL: null,
      yearBasis: null,
      indexRateChangeFrequency: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNoAccruals);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNoAccruals)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has no repayments`, async () => {
    const loanTransactionInAcbsWithNoRepayments = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    loanTransactionInAcbsWithNoRepayments.BundleMessageList[0].RepaymentScheduleList = [];
    const expectedLoanTransactionWithNoRepayments: GetFacilityLoanTransactionResponseDto = {
      ...expectedLoanTransaction,
      nextDueDate: null,
      loanBillingFrequencyType: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, loanTransactionInAcbsWithNoRepayments);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNoRepayments)));
  });

  it(`returns a 400 response if the loan transaction is returned by ACBS and the 0th element of BundleMessageList is NOT a 'NewLoanRequest'`, async () => {
    const invalidloanTransactionInAcbs = JSON.parse(JSON.stringify(acbsFacilityLoanTransaction));
    invalidloanTransactionInAcbs.BundleMessageList.unshift({
      $type: 'AccrualScheduleAmountTransaction',
    });

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(200, invalidloanTransactionInAcbs);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      message: 'Bad request',
      error: 'The provided bundleIdentifier does not correspond to a loan transaction.',
    });
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(400, 'BundleInformation not found or user does not have access to it.');

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response that is not a string when getting the loan transaction', async () => {
    const acbsErrorMessage = { Message: 'error message' };
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(400, acbsErrorMessage);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the loan transaction from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().reply(401);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the loan transaction from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetFacilityLoanTransaction().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, acbsFacilityLoanTransaction);

    const { status, body } = await api.get(getFacilityLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  describe('URL validation', () => {
    withFacilityIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForFacilityId: () => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetFacilityLoanTransactionInAcbsSucceeds();
      },
      makeRequestWithFacilityId: (facilityId) => api.get(getGetFacilityLoanTransactionUrl(facilityId, bundleIdentifier)),
    });
    withBundleIdentifierUrlValidationApiTests({
      givenRequestWouldOtherwiseSucceedForBundleId: (bundleId: string) => {
        givenAuthenticationWithTheIdpSucceeds();
        givenRequestToGetFacilityLoanTransactionInAcbsSucceedsWithBundleId(bundleId);
      },
      makeRequestWithBundleId: (bundleId) => api.get(getGetFacilityLoanTransactionUrl(facilityIdentifier, bundleId)),
    });
  });

  const givenRequestToGetFacilityLoanTransactionInAcbsSucceeds = () => givenRequestToGetFacilityLoanTransactionInAcbsSucceedsWithBundleId(bundleIdentifier);

  const givenRequestToGetFacilityLoanTransactionInAcbsSucceedsWithBundleId = (bundleId: string): nock.Scope => {
    return requestToGetFacilityLoanTransactionWithBundleId(bundleId).reply(200, acbsFacilityLoanTransaction);
  };

  const requestToGetFacilityLoanTransaction = () => requestToGetFacilityLoanTransactionWithBundleId(bundleIdentifier);

  const requestToGetFacilityLoanTransactionWithBundleId = (bundleId: string): nock.Interceptor =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/BundleInformation/${bundleId}?returnItems=true`).matchHeader('authorization', `Bearer ${idToken}`);
});

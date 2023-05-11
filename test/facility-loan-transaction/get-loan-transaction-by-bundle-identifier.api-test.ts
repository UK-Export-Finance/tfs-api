import { PROPERTIES } from '@ukef/constants';
import { DateStringTransformations } from '@ukef/modules/date/date-string.transformations';
import { GetFacilityLoanTransactionResponseItem } from '@ukef/modules/facility-loan-transaction/dto/get-loan-transaction-response.dto';
import { withAcbsAuthenticationApiTests } from '@ukef-test/common-tests/acbs-authentication-api-tests';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_ACBS_TIMEOUT } from '@ukef-test/support/environment-variables';
import { GetFacilityLoanTransactionGenerator } from '@ukef-test/support/generator/get-facility-loan-transaction-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import nock from 'nock';

describe('GET /facilities/{facilityIdentifier}/loan-transactions/{bundleIdentifier}', () => {
  const valueGenerator = new RandomValueGenerator();
  const dateStringTransformations = new DateStringTransformations();
  const { portfolioIdentifier } = PROPERTIES.GLOBAL;
  const facilityIdentifier = valueGenerator.ukefId();
  const bundleIdentifier = valueGenerator.acbsBundleId();
  const getLoanTransactionUrl = `/api/v1/facilities/${facilityIdentifier}/loan-transactions/${bundleIdentifier}`;

  const { facilityLoanTransactionsInAcbs, facilityLoanTransactionsFromApi } = new GetFacilityLoanTransactionGenerator(
    valueGenerator,
    dateStringTransformations,
  ).generate({
    numberToGenerate: 1,
    facilityIdentifier,
    portfolioIdentifier,
  });

  const [loanTransactionInAcbs] = facilityLoanTransactionsInAcbs;
  const [expectedLoanTransaction] = facilityLoanTransactionsFromApi;

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
    givenRequestWouldOtherwiseSucceed: () => requestToGetLoanTransaction().reply(200, loanTransactionInAcbs),
    makeRequest: () => api.get(getLoanTransactionUrl),
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      givenAuthenticationWithTheIdpSucceeds();
      requestToGetLoanTransaction().reply(200, loanTransactionInAcbs);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getLoanTransactionUrl, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbs);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransaction)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and DealCustomerUsageRate is null', async () => {
    const loanTransactionInAcbsWithNullDealCustomerUsageRate = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    loanTransactionInAcbsWithNullDealCustomerUsageRate.BundleMessageList[0].DealCustomerUsageRate = null;
    const expectedLoanTransactionWithNullValue: GetFacilityLoanTransactionResponseItem = {
      ...expectedLoanTransaction,
      dealCustomerUsageRate: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbsWithNullDealCustomerUsageRate);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedLoanTransactionWithNullValue)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and OperationTypeCode is null', async () => {
    const loanTransactionInAcbsWithNullOperationTypeCode = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    loanTransactionInAcbsWithNullOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = null;
    const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseItem = {
      ...expectedLoanTransaction,
      dealCustomerUsageOperationType: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbsWithNullOperationTypeCode);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityLoanTransactionsWithNullValue)));
  });

  it('returns a 200 response with the loan transaction if it is returned by ACBS and OperationTypeCode is empty', async () => {
    const loanTransactionInAcbsWithEmptyOperationTypeCode = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    loanTransactionInAcbsWithEmptyOperationTypeCode.BundleMessageList[0].DealCustomerUsageOperationType.OperationTypeCode = '';
    const expectedFacilityLoanTransactionsWithNullValue: GetFacilityLoanTransactionResponseItem = {
      ...expectedLoanTransaction,
      dealCustomerUsageOperationType: null,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbsWithEmptyOperationTypeCode);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityLoanTransactionsWithNullValue)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has more than one accrual with the category code 'PAC01'`, async () => {
    const loanTransactionInAcbsWithMoreThanOnePacAccrual = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    loanTransactionInAcbsWithMoreThanOnePacAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.pac,
      },
      SpreadRate: 0,
      YearBasis: {
        YearBasisCode: '',
      },
      IndexRateChangeFrequency: {
        IndexRateChangeFrequencyCode: '',
      },
    });
    const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseItem = {
      ...expectedLoanTransaction,
      spreadRate: 0,
      indexRateChangeFrequency: '',
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbsWithMoreThanOnePacAccrual);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityLoanTransactionsWithAdditionalAccrual)));
  });

  it(`returns a 200 response with the loan transaction if it is returned by ACBS and it has more than one accrual with the category code 'CTL01'`, async () => {
    const loanTransactionInAcbsWithMoreThanOneCtlAccrual = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    loanTransactionInAcbsWithMoreThanOneCtlAccrual.BundleMessageList[0].AccrualScheduleList.splice(1, 0, {
      AccrualCategory: {
        AccrualCategoryCode: PROPERTIES.FACILITY_LOAN_TRANSACTION.DEFAULT.bundleMessageList.accrualScheduleList.accrualCategory.accrualCategoryCode.ctl,
      },
      SpreadRate: 0,
      YearBasis: {
        YearBasisCode: '',
      },
      IndexRateChangeFrequency: {
        IndexRateChangeFrequencyCode: '',
      },
    });
    const expectedFacilityLoanTransactionsWithAdditionalAccrual: GetFacilityLoanTransactionResponseItem = {
      ...expectedLoanTransaction,
      spreadRateCTL: 0,
    };

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, loanTransactionInAcbsWithMoreThanOneCtlAccrual);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(200);
    expect(body).toStrictEqual(JSON.parse(JSON.stringify(expectedFacilityLoanTransactionsWithAdditionalAccrual)));
  });

  it(`returns a 400 response if the loan transaction is returned by ACBS and the 0th element of BundleMessageList is NOT a 'NewLoanRequest'`, async () => {
    const invalidloanTransactionInAcbs = JSON.parse(JSON.stringify(loanTransactionInAcbs));
    invalidloanTransactionInAcbs.BundleMessageList.unshift({
      $type: 'AccrualScheduleAmountTransaction',
    });

    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(200, invalidloanTransactionInAcbs);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      statusCode: 400,
      message: 'Bad request',
      error: 'The provided bundleIdentifier does not correspond to a loan transaction.',
    });
  });

  it('returns a 404 response if ACBS returns a 400 response with the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(400, 'BundleInformation not found or user does not have access to it.');

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(404);
    expect(body).toStrictEqual({
      statusCode: 404,
      message: 'Not found',
    });
  });

  it('returns a 500 response if ACBS returns a 400 response without the string "BundleInformation not found"', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(400, 'An error message from ACBS.');

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the loan transaction from ACBS returns a status code that is NOT 200 or 400', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().reply(401);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns a 500 response if getting the loan transaction from ACBS times out', async () => {
    givenAuthenticationWithTheIdpSucceeds();
    requestToGetLoanTransaction().delay(TIME_EXCEEDING_ACBS_TIMEOUT).reply(200, loanTransactionInAcbs);

    const { status, body } = await api.get(getLoanTransactionUrl);

    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  const requestToGetLoanTransaction = () =>
    nock(ENVIRONMENT_VARIABLES.ACBS_BASE_URL).get(`/BundleInformation/${bundleIdentifier}?returnItems=true`).matchHeader('authorization', `Bearer ${idToken}`);
});

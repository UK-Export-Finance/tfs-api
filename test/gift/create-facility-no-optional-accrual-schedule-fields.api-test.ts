import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  accrualScheduleFixedRateUrl,
  accrualScheduleIndexedRateUrl,
  apimFacilityWithoutQueueUrl,
  apimMdmObligationSubtypesUrl,
  approveStatusUrl,
  businessCalendarsConventionUrl,
  businessCalendarUrl,
  counterpartyRolesUrl,
  counterpartyUrl,
  currencyUrl,
  facilityCreationUrl,
  feeTypeUrl,
  fixedFeeUrl,
  mockResponses,
  obligationUrl,
  payloadAccrualSchedules,
  productTypeUrl,
  repaymentProfileUrl,
  riskDetailsUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;
const { APIM_MDM_KEY, APIM_MDM_URL, APIM_MDM_VALUE } = ENVIRONMENT_VARIABLES;

const { PRODUCT_TYPE_CODES } = GIFT;

const setupMocks = () => {
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.BIP)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.EXIP)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.BSS)).reply(HttpStatus.OK, mockResponses.productType);
  nock(GIFT_API_URL).persist().get(productTypeUrl(PRODUCT_TYPE_CODES.GEF)).reply(HttpStatus.OK, mockResponses.productType);

  nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

  nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

  nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

  nock(APIM_MDM_URL)
    .persist()
    .get(apimMdmObligationSubtypesUrl)
    .matchHeader(APIM_MDM_KEY, APIM_MDM_VALUE)
    .reply(HttpStatus.OK, mockResponses.obligationSubtypes);

  nock(GIFT_API_URL).persist().post(facilityCreationUrl).reply(HttpStatus.CREATED, mockResponses.facility);

  /**
   * Register accrual schedule endpoints with matchers to validate null values
   * These matchers must be first so they take precedence
   */
  const accrualScheduleFixedRateMatcher = nock(GIFT_API_URL)
    .post(accrualScheduleFixedRateUrl)
    .reply(HttpStatus.CREATED, mockResponses.accrualScheduleNoOptionalDates);

  const accrualScheduleIndexedRateMatcher = nock(GIFT_API_URL).post(accrualScheduleIndexedRateUrl).reply(HttpStatus.CREATED, mockResponses.accrualSchedule);

  // Allow multiple calls (replying multiple times for each accrual schedule)
  accrualScheduleFixedRateMatcher.persist();
  accrualScheduleIndexedRateMatcher.persist();

  nock(GIFT_API_URL).persist().post(businessCalendarUrl).reply(HttpStatus.CREATED, mockResponses.businessCalendar);

  nock(GIFT_API_URL).persist().post(businessCalendarsConventionUrl).reply(HttpStatus.CREATED, mockResponses.businessCalendarsConvention);

  nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

  nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

  nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

  nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

  nock(GIFT_API_URL).persist().post(riskDetailsUrl).reply(HttpStatus.CREATED, mockResponses.riskDetails);

  nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);
};

describe('POST /gift/facility', () => {
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

  describe(`when accrual schedules do not contain optional date fields and a ${HttpStatus.CREATED} response is returned by all GIFT endpoints`, () => {
    it(`should return a ${HttpStatus.CREATED} response with a facility and all created entities`, async () => {
      // Arrange
      setupMocks();

      // Act
      const { status, body } = await api.post(apimFacilityWithoutQueueUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD_WITHOUT_OPTIONAL_ACCRUAL_DATES);

      // Assert
      expect(status).toBe(HttpStatus.CREATED);

      const expected = new Array(payloadAccrualSchedules.length).fill(mockResponses.accrualScheduleNoOptionalDates.data);

      expect(body.accrualSchedules).toStrictEqual(expected);
    });
  });
});

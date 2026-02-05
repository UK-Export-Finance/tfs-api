import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { MockGiftResponse } from '@ukef-test/support/interfaces/mock-gift-response.interface';
import nock from 'nock';

import {
  apimFacilityUrl,
  approveStatusUrl,
  businessCalendarsConvention,
  businessCalendarsConventionUrl,
  businessCalendarUrl,
  counterpartyRolesUrl,
  counterpartyUrl,
  currencyUrl,
  facilityCreationUrl,
  feeTypeUrl,
  fixedFeeUrl,
  getExpectedValidationErrors,
  mockResponses,
  obligationSubtypeUrl,
  obligationUrl,
  productTypeUrl,
  repaymentProfileUrl,
  riskDetailsUrl,
} from './test-helpers';

const { API_RESPONSE_MESSAGES, ENTITY_NAMES } = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

/**
 * Setup mocks for all endpoints.
 * @param {MockGiftResponse} Mock business calendars convention response
 */
const setupMocks = (businessCalendarsConventionResponse: MockGiftResponse) => {
  nock(GIFT_API_URL).persist().get(productTypeUrl).reply(HttpStatus.OK, mockResponses.productType);

  nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

  nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

  nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

  nock(GIFT_API_URL).persist().get(obligationSubtypeUrl).reply(HttpStatus.OK, mockResponses.obligationSubtype);

  nock(GIFT_API_URL).post(facilityCreationUrl).reply(HttpStatus.CREATED, mockResponses.facility);

  nock(GIFT_API_URL).persist().post(businessCalendarUrl).reply(HttpStatus.CREATED, mockResponses.businessCalendar);

  nock(GIFT_API_URL).persist().post(businessCalendarsConventionUrl).reply(businessCalendarsConventionResponse.statusCode, businessCalendarsConventionResponse);

  nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

  nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

  nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

  nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.repaymentProfile);

  nock(GIFT_API_URL).persist().post(riskDetailsUrl).reply(HttpStatus.CREATED, mockResponses.riskDetails);

  nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.OK, mockResponses.approveStatus);
};

describe('POST /gift/facility - business calendars convention error handling', () => {
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

  describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT business calendars convention endpoint`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a mapped body/validation errors`, async () => {
      // Arrange
      setupMocks(mockResponses.badRequest);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        ...mockResponses.badRequest,
        message: API_RESPONSE_MESSAGES.GIFT_FACILITY_VALIDATION_ERRORS,
        validationErrors: getExpectedValidationErrors([businessCalendarsConvention], mockResponses.badRequest, ENTITY_NAMES.BUSINESS_CALENDARS_CONVENTION),
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT business calendars convention endpoint`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      // Arrange
      setupMocks(mockResponses.unauthorized);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.UNAUTHORIZED);

      const expected = {
        ...mockResponses.unauthorized,
        validationErrors: getExpectedValidationErrors([businessCalendarsConvention], mockResponses.unauthorized, ENTITY_NAMES.BUSINESS_CALENDARS_CONVENTION),
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.FORBIDDEN} response is returned by the GIFT business calendars convention endpoint`, () => {
    it(`should return a ${HttpStatus.FORBIDDEN} response`, async () => {
      // Arrange
      setupMocks(mockResponses.forbidden);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.FORBIDDEN);

      const expected = {
        ...mockResponses.forbidden,
        validationErrors: getExpectedValidationErrors([businessCalendarsConvention], mockResponses.forbidden, ENTITY_NAMES.BUSINESS_CALENDARS_CONVENTION),
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT business calendars convention endpoint`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      setupMocks(mockResponses.internalServerError);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe('when an unacceptable response is returned by the GIFT business calendars convention endpoint', () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      setupMocks(mockResponses.iAmATeapot);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });
});

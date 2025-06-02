import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import {
  apimFacilityUrl,
  approveStatusUrl,
  counterpartyUrl,
  currencyUrl,
  feeTypeUrl,
  fixedFeeUrl,
  mockResponses,
  obligationUrl,
  repaymentProfileUrl,
} from './test-helpers';

const { API_RESPONSE_MESSAGES, PATH } = GIFT;

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility - approve status error handling', () => {
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

  describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT approve status endpoint`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.badRequest);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT approve status endpoint`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.unauthorized);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.UNAUTHORIZED);

      const expected = {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.FORBIDDEN} response is returned by the GIFT approve status endpoint`, () => {
    it(`should return a ${HttpStatus.FORBIDDEN} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.counterparty);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.unauthorized);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.FORBIDDEN, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.FORBIDDEN);

      const expected = {
        statusCode: HttpStatus.FORBIDDEN,
        message: API_RESPONSE_MESSAGES.APPROVED_STATUS_ERROR_MESSAGE,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT approve status endpoint`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED, mockResponses.badRequest);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED, mockResponses.badRequest);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe(`when an unacceptable response is returned by the GIFT approve status endpoint`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).post(PATH.CREATE_FACILITY).reply(HttpStatus.CREATED, mockResponses.facility);

      nock(GIFT_API_URL).persist().post(counterpartyUrl).reply(HttpStatus.CREATED);

      nock(GIFT_API_URL).persist().post(fixedFeeUrl).reply(HttpStatus.CREATED, mockResponses.fixedFee);

      nock(GIFT_API_URL).persist().post(obligationUrl).reply(HttpStatus.CREATED, mockResponses.obligation);

      nock(GIFT_API_URL).persist().post(repaymentProfileUrl).reply(HttpStatus.CREATED);

      nock(GIFT_API_URL).persist().post(approveStatusUrl).reply(HttpStatus.I_AM_A_TEAPOT, mockResponses.approveStatus);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });
});

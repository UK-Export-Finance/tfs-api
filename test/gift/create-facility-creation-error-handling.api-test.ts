import { HttpStatus } from '@nestjs/common';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import nock from 'nock';

import { apimFacilityUrl, currencyUrl, facilityCreationUrl, feeTypeUrl, mockResponses } from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

describe('POST /gift/facility - facility creation error handling', () => {
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

  describe(`when a ${HttpStatus.BAD_REQUEST} response is returned by the GIFT facility endpoint`, () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(facilityCreationUrl).reply(HttpStatus.BAD_REQUEST, mockResponses.badRequest);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = mockResponses.badRequest;

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT facility endpoint`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(facilityCreationUrl).reply(HttpStatus.UNAUTHORIZED, mockResponses.unauthorized);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.UNAUTHORIZED);

      expect(body).toStrictEqual(mockResponses.unauthorized);
    });
  });

  describe('when an unacceptable status is returned by the GIFT facility endpoint', () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(facilityCreationUrl).reply(HttpStatus.I_AM_A_TEAPOT);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });

  describe(`when a ${HttpStatus.INTERNAL_SERVER_ERROR} status is returned by the GIFT facility endpoint`, () => {
    it(`should return a ${HttpStatus.INTERNAL_SERVER_ERROR} response`, async () => {
      // Arrange
      nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

      nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

      nock(GIFT_API_URL).post(facilityCreationUrl).reply(HttpStatus.INTERNAL_SERVER_ERROR);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });
});

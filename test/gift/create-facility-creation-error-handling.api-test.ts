import { HttpStatus } from '@nestjs/common';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { MockGiftResponse } from '@ukef-test/support/interfaces/mock-gift-response.interface';
import nock from 'nock';

import {
  apimFacilityUrl,
  counterpartyRolesUrl,
  currencyUrl,
  facilityCreationUrl,
  feeTypeUrl,
  mockResponses,
  obligationSubtypeUrl,
  productTypeUrl,
} from './test-helpers';

const { GIFT_API_URL } = ENVIRONMENT_VARIABLES;

/**
 * Setup mocks for all endpoints.
 * @param {MockGiftResponse} Mock "facility createion" response
 */
const setupMocks = (facilityCreationResponse: MockGiftResponse) => {
  nock(GIFT_API_URL).persist().get(productTypeUrl).reply(HttpStatus.OK, mockResponses.productType);

  nock(GIFT_API_URL).persist().get(currencyUrl).reply(HttpStatus.OK, mockResponses.currencies);

  nock(GIFT_API_URL).persist().get(feeTypeUrl).reply(HttpStatus.OK, mockResponses.feeTypes);

  nock(GIFT_API_URL).persist().get(counterpartyRolesUrl).reply(HttpStatus.OK, mockResponses.counterpartyRoles);

  nock(GIFT_API_URL).persist().get(obligationSubtypeUrl).reply(HttpStatus.OK, mockResponses.obligationSubtype);

  nock(GIFT_API_URL).post(facilityCreationUrl).reply(facilityCreationResponse.statusCode, facilityCreationResponse);
};

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
      setupMocks(mockResponses.badRequest);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = mockResponses.badRequest;

      expect(body).toStrictEqual(expected);
    });
  });

  describe(`when a ${HttpStatus.FORBIDDEN} response is returned by the GIFT facility endpoint`, () => {
    it(`should return a ${HttpStatus.FORBIDDEN} response`, async () => {
      // Arrange
      setupMocks(mockResponses.forbidden);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.FORBIDDEN);

      expect(body).toStrictEqual(mockResponses.forbidden);
    });
  });

  describe(`when a ${HttpStatus.UNAUTHORIZED} response is returned by the GIFT facility endpoint`, () => {
    it(`should return a ${HttpStatus.UNAUTHORIZED} response`, async () => {
      // Arrange
      setupMocks(mockResponses.unauthorized);

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
      setupMocks(mockResponses.iAmATeapot);

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
      setupMocks(mockResponses.internalServerError);

      // Act
      const { status, body } = await api.post(apimFacilityUrl, GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD);

      // Assert
      expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(body).toStrictEqual(mockResponses.internalServerError);
    });
  });
});

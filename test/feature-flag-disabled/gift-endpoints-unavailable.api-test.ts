import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';

import { mockFacilityId } from '../gift/test-helpers';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const { PATH } = GIFT;

/**
 * Tests for GIFT endpoints when the feature flag FF_GIFT_ENABLED is set to false.
 * NOTE: FF_GIFT_ENABLED is set to 'false' by test setup:
 * jest.config.ts => setup/disable-gift-feature-flag.ts
 */
describe('GIFT Endpoints - Feature Flag disabled', () => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  describe('when FF_GIFT_ENABLED is false', () => {
    it(`GET /gift/currency should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.CURRENCY}`;

      // Act
      const response = await api.getWithoutAuth(endpointUrl);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`GET /gift/fee-type should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FEE_TYPE}`;

      // Act
      const response = await api.getWithoutAuth(endpointUrl);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`GET /gift/facilities should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITIES}`;

      // Act
      const response = await api.getWithoutAuth(endpointUrl);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`GET /gift/facility/:facilityId should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITIES}/${mockFacilityId}`;

      // Act
      const response = await api.getWithoutAuth(endpointUrl);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}`;
      const payload = GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD;

      // Act
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility/:facilityId/amendment should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/amendment`;
      const payload = GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD;

      // Act
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility/:facilityId/amendment/without-queue should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/amendment/without-queue`;
      const payload = GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD;

      // Act
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility/:facilityId/multiple-amendments should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/multiple-amendments`;
      const payload = GIFT_EXAMPLES.FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD;

      // Arrange
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Act
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility/:facilityId/multiple-amendments/without-queue should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/multiple-amendments/without-queue`;
      const payload = GIFT_EXAMPLES.FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD;

      // Act
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`POST /gift/facility/without-queue should return ${HttpStatus.NOT_FOUND}`, async () => {
      // Arrange
      const endpointUrl = `/api/${prefixAndVersion}/gift${PATH.FACILITY}/without-queue`;
      const payload = GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD;

      // Act
      const response = await api.postWithoutAuth(endpointUrl, payload);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});

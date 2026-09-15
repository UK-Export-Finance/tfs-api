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
    const getEndpoints = [
      { description: 'GET /gift/currency', endpointUrl: `/api/${prefixAndVersion}/gift${PATH.CURRENCY}` },
      { description: 'GET /gift/fee-type', endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FEE_TYPE}` },
      { description: 'GET /gift/facilities', endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITIES}` },
      {
        description: 'GET /gift/facility/:facilityId',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITIES}/${mockFacilityId}`,
      },
    ];

    describe.each(getEndpoints)('$description should return 404', ({ endpointUrl }) => {
      it(`returns ${HttpStatus.NOT_FOUND}`, async () => {
        // Act
        const response = await api.getWithoutAuth(endpointUrl);

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
    });

    const postEndpoints = [
      {
        description: 'POST /gift/facility',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}`,
        payload: GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD,
      },
      {
        description: 'POST /gift/facility/without-queue',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}/without-queue`,
        payload: GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD,
      },
      {
        description: 'POST /gift/facility/:facilityId/amendment',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/amendment`,
        payload: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD,
      },
      {
        description: 'POST /gift/facility/:facilityId/amendment/without-queue',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/amendment/without-queue`,
        payload: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD,
      },
      {
        description: 'POST /gift/facility/:facilityId/multiple-amendments',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/multiple-amendments`,
        payload: GIFT_EXAMPLES.FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD,
      },
      {
        description: 'POST /gift/facility/:facilityId/multiple-amendments/without-queue',
        endpointUrl: `/api/${prefixAndVersion}/gift${PATH.FACILITY}/${mockFacilityId}/multiple-amendments/without-queue`,
        payload: GIFT_EXAMPLES.FACILITY_MULTIPLE_AMENDMENTS_REQUEST_PAYLOAD,
      },
    ];

    describe.each(postEndpoints)('$description should return 404', ({ endpointUrl, payload }) => {
      it(`returns ${HttpStatus.NOT_FOUND}`, async () => {
        // Act
        const response = await api.postWithoutAuth(endpointUrl, payload);

        // Assert
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
    });
  });
});

import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { booleanValidation, numberStringValidation, numberValidation, stringValidation, ukefIdValidation } from './assertions';

const {
  PATH: { FACILITY },
} = GIFT;

describe('POST /gift/facility - validation', () => {
  const url = `/api/v1/gift${FACILITY}`;

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

  describe('when no overview object is provided', () => {
    it('should return a 400 response with a validation error', async () => {
      const mockPayload = {};

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(400);

      const expected = {
        error: 'Bad Request',
        message: ['overview should not be null or undefined', 'overview must be a non-empty object'],
        statusCode: 400,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an empty overview object is provided', () => {
    it('should return a 400 response with validation errors for all required fields', async () => {
      const mockPayload = { overview: {} };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(400);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview.currency must be a string',
          'overview.dealId must be a string',
          'overview.dealId must be longer than or equal to 10 characters',
          'overview.dealId must match /^00\\d{8}$/ regular expression',
          'overview.effectiveDate must be a string',
          'overview.endOfCoverDate must be a string',
          'overview.expiryDate must be a string',
          'overview.facilityAmount must not be less than 0',
          'overview.facilityId must be a string',
          'overview.facilityId must be longer than or equal to 10 characters',
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.isRevolving must be a boolean value',
          'overview.name must be a string',
          'overview.obligorUrn must be a number string',
          'overview.productType must be a string',
        ],
        statusCode: 400,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  const baseParams = {
    parentFieldName: 'overview',
    initialPayload: GIFT_EXAMPLES.FACILITY_CREATION_PAYLOAD,
    url,
  };

  stringValidation({ ...baseParams, fieldName: 'currency' });

  ukefIdValidation({ ...baseParams, fieldName: 'dealId' });

  stringValidation({ ...baseParams, fieldName: 'effectiveDate' });

  stringValidation({ ...baseParams, fieldName: 'endOfCoverDate' });

  stringValidation({ ...baseParams, fieldName: 'expiryDate' });

  numberValidation({ ...baseParams, fieldName: 'facilityAmount' });

  ukefIdValidation({ ...baseParams, fieldName: 'facilityId' });

  booleanValidation({ ...baseParams, fieldName: 'isRevolving' });

  stringValidation({ ...baseParams, fieldName: 'name' });

  numberStringValidation({ ...baseParams, fieldName: 'obligorUrn' });

  stringValidation({ ...baseParams, fieldName: 'productType' });
});

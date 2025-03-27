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
          'overview.facilityId must be a string',
          'overview.facilityId must be longer than or equal to 10 characters',
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.productType must be a string',
          'overview.name must be a string',
          'overview.obligorUrn must be a number string',
          'overview.currency must be a string',
          'overview.facilityAmount must not be less than 0',
          'overview.effectiveDate must be a string',
          'overview.expiryDate must be a string',
          'overview.endOfCoverDate must be a string',
          'overview.dealId must be a string',
          'overview.dealId must be longer than or equal to 10 characters',
          'overview.dealId must match /^00\\d{8}$/ regular expression',
          'overview.isRevolving must be a boolean value',
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

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.currency',
    fieldName: 'currency',
  });

  ukefIdValidation({
    ...baseParams,
    fieldPath: 'overview.dealId',
    fieldName: 'dealId',
  });

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.effectiveDate',
    fieldName: 'effectiveDate',
    url,
  });

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.endOfCoverDate',
    fieldName: 'endOfCoverDate',
    url,
  });

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.expiryDate',
    fieldName: 'expiryDate',
  });

  numberValidation({
    ...baseParams,
    fieldPath: 'overview.facilityAmount',
    fieldName: 'facilityAmount',
  });

  ukefIdValidation({
    ...baseParams,
    fieldPath: 'overview.facilityId',
    fieldName: 'facilityId',
  });

  booleanValidation({
    ...baseParams,
    fieldPath: 'overview.isRevolving',
    fieldName: 'isRevolving',
  });

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.name',
    fieldName: 'name',
  });

  numberStringValidation({
    ...baseParams,
    fieldPath: 'overview.obligorUrn',
    fieldName: 'obligorUrn',
  });

  stringValidation({
    ...baseParams,
    fieldPath: 'overview.productType',
    fieldName: 'productType',
  });
});

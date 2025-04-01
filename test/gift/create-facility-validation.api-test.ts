import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { booleanValidation, numberValidation, stringValidation, ukefIdValidation } from './assertions';

const {
  PATH: { FACILITY },
  VALIDATION,
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
          'overview.currency should not be null or undefined',
          `overview.currency must be longer than or equal to ${VALIDATION.CURRENCY.MIN} characters`,
          'overview.currency must be a string',
          'overview.dealId must be a string',
          `overview.dealId must be longer than or equal to ${VALIDATION.DEAL_ID.MIN} characters`,
          'overview.dealId must match /^00\\d{8}$/ regular expression',
          'overview.effectiveDate should not be null or undefined',
          `overview.effectiveDate must be longer than or equal to ${VALIDATION.EFFECTIVE_DATE.MIN} characters`,
          'overview.effectiveDate must be a string',
          'overview.endOfCoverDate should not be null or undefined',
          `overview.endOfCoverDate must be longer than or equal to ${VALIDATION.END_OF_COVER_DATE.MIN} characters`,
          'overview.endOfCoverDate must be a string',
          'overview.expiryDate should not be null or undefined',
          `overview.expiryDate must be longer than or equal to ${VALIDATION.EXPIRY_DATE.MIN} characters`,
          'overview.expiryDate must be a string',
          'overview.facilityAmount should not be null or undefined',
          `overview.facilityAmount must not be less than ${VALIDATION.FACILITY_AMOUNT.MIN}`,
          'overview.facilityAmount must be a number conforming to the specified constraints',
          'overview.facilityId must be a string',
          `overview.facilityId must be longer than or equal to ${VALIDATION.FACILITY_ID.MIN} characters`,
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.isRevolving should not be null or undefined',
          'overview.isRevolving must be a boolean value',
          'overview.name should not be null or undefined',
          `overview.name must be longer than or equal to ${VALIDATION.FACILITY_NAME.MIN} characters`,
          'overview.name must be a string',
          'overview.obligorUrn should not be null or undefined',
          'overview.obligorUrn must be a number string',
          'overview.productType should not be null or undefined',
          `overview.productType must be longer than or equal to ${VALIDATION.PRODUCT_TYPE.MIN} characters`,
          'overview.productType must be a string',
        ],
        statusCode: 400,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  const baseParams = {
    parentFieldName: 'overview',
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    url,
  };

  describe('overview.currency', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'currency',
      min: VALIDATION.CURRENCY.MIN,
      max: VALIDATION.CURRENCY.MAX,
    });
  });

  describe('overview.dealId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'dealId',
      min: VALIDATION.DEAL_ID.MIN,
      max: VALIDATION.DEAL_ID.MAX,
    });
  });

  describe('overview.effectiveDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
      min: VALIDATION.EFFECTIVE_DATE.MIN,
      max: VALIDATION.EFFECTIVE_DATE.MAX,
    });
  });

  describe('overview.endOfCoverDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'endOfCoverDate',
      min: VALIDATION.END_OF_COVER_DATE.MIN,
      max: VALIDATION.END_OF_COVER_DATE.MAX,
    });
  });

  describe('overview.expiryDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'expiryDate',
      min: VALIDATION.EXPIRY_DATE.MIN,
      max: VALIDATION.EXPIRY_DATE.MAX,
    });
  });

  describe('overview.facilityAmount', () => {
    numberValidation({
      ...baseParams,
      fieldName: 'facilityAmount',
      min: VALIDATION.FACILITY_AMOUNT.MIN,
    });
  });

  describe('overview.facilityId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'facilityId',
      min: VALIDATION.FACILITY_ID.MIN,
      max: VALIDATION.FACILITY_ID.MAX,
    });
  });

  describe('overview.isRevolving', () => {
    booleanValidation({ ...baseParams, fieldName: 'isRevolving' });
  });

  describe('overview.name', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'name',
      min: VALIDATION.FACILITY_NAME.MIN,
      max: VALIDATION.FACILITY_NAME.MAX,
    });
  });

  describe('overview.productType', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'productType',
      min: VALIDATION.PRODUCT_TYPE.MIN,
      max: VALIDATION.PRODUCT_TYPE.MAX,
    });
  });
});

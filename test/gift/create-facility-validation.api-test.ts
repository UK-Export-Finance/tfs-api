import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { booleanValidation, numberStringValidation, numberValidation, stringValidation, ukefIdValidation } from './assertions';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
  VALIDATION: {
    FACILITY: { OVERVIEW: OVERVIEW_VALIDATION },
  },
} = GIFT;

describe('POST /gift/facility - validation', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

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

  describe('when an empty object provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a validation error`, async () => {
      const mockPayload = {};

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'counterparties should not be null or undefined',
          'counterparties should not be empty',
          'counterparties must be an array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'repaymentProfiles should not be null or undefined',
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an unpopulated object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = { overview: {}, counterparties: [], repaymentProfiles: [] };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview.currency should not be null or undefined',
          `overview.currency must be longer than or equal to ${OVERVIEW_VALIDATION.CURRENCY.MIN_LENGTH} characters`,
          'overview.currency must be a string',
          'overview.dealId must be a string',
          `overview.dealId must be longer than or equal to ${OVERVIEW_VALIDATION.DEAL_ID.MIN_LENGTH} characters`,
          'overview.dealId must match /^00\\d{8}$/ regular expression',
          'overview.effectiveDate should not be null or undefined',
          `overview.effectiveDate must be longer than or equal to ${OVERVIEW_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH} characters`,
          'overview.effectiveDate must be a string',
          'overview.endOfCoverDate should not be null or undefined',
          `overview.endOfCoverDate must be longer than or equal to ${OVERVIEW_VALIDATION.END_OF_COVER_DATE.MIN_LENGTH} characters`,
          'overview.endOfCoverDate must be a string',
          'overview.expiryDate should not be null or undefined',
          `overview.expiryDate must be longer than or equal to ${OVERVIEW_VALIDATION.EXPIRY_DATE.MIN_LENGTH} characters`,
          'overview.expiryDate must be a string',
          'overview.facilityAmount should not be null or undefined',
          `overview.facilityAmount must not be less than ${OVERVIEW_VALIDATION.FACILITY_AMOUNT.MIN}`,
          'overview.facilityAmount must be a number conforming to the specified constraints',
          'overview.facilityId must be a string',
          `overview.facilityId must be longer than or equal to ${OVERVIEW_VALIDATION.FACILITY_ID.MIN_LENGTH} characters`,
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.isRevolving should not be null or undefined',
          'overview.isRevolving must be a boolean value',
          'overview.name should not be null or undefined',
          `overview.name must be longer than or equal to ${OVERVIEW_VALIDATION.FACILITY_NAME.MIN_LENGTH} characters`,
          'overview.name must be a string',
          'overview.obligorUrn should not be null or undefined',
          `overview.obligorUrn must be longer than or equal to ${OVERVIEW_VALIDATION.OBLIGOR_URN.MIN_LENGTH} characters`,
          'overview.obligorUrn must be a number string',
          'overview.productType should not be null or undefined',
          `overview.productType must be longer than or equal to ${OVERVIEW_VALIDATION.PRODUCT_TYPE.MIN_LENGTH} characters`,
          'overview.productType must be a string',
          'counterparties should not be empty',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'repaymentProfiles should not be empty',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
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
      min: OVERVIEW_VALIDATION.CURRENCY.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.CURRENCY.MAX_LENGTH,
    });
  });

  describe('overview.dealId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'dealId',
      min: OVERVIEW_VALIDATION.DEAL_ID.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.DEAL_ID.MAX_LENGTH,
    });
  });

  describe('overview.effectiveDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
      min: OVERVIEW_VALIDATION.EFFECTIVE_DATE.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.EFFECTIVE_DATE.MAX_LENGTH,
    });
  });

  describe('overview.endOfCoverDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'endOfCoverDate',
      min: OVERVIEW_VALIDATION.END_OF_COVER_DATE.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.END_OF_COVER_DATE.MAX_LENGTH,
    });
  });

  describe('overview.expiryDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'expiryDate',
      min: OVERVIEW_VALIDATION.EXPIRY_DATE.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.EXPIRY_DATE.MAX_LENGTH,
    });
  });

  describe('overview.facilityAmount', () => {
    numberValidation({
      ...baseParams,
      fieldName: 'facilityAmount',
      min: OVERVIEW_VALIDATION.FACILITY_AMOUNT.MIN,
    });
  });

  describe('overview.facilityId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'facilityId',
      min: OVERVIEW_VALIDATION.FACILITY_ID.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.FACILITY_ID.MAX_LENGTH,
    });
  });

  describe('overview.isRevolving', () => {
    booleanValidation({ ...baseParams, fieldName: 'isRevolving' });
  });

  describe('overview.name', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'name',
      min: OVERVIEW_VALIDATION.FACILITY_NAME.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.FACILITY_NAME.MAX_LENGTH,
    });
  });

  describe('overview.obligorUrn', () => {
    numberStringValidation({
      ...baseParams,
      fieldName: 'obligorUrn',
      min: OVERVIEW_VALIDATION.OBLIGOR_URN.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.OBLIGOR_URN.MAX_LENGTH,
    });
  });

  describe('overview.productType', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'productType',
      min: OVERVIEW_VALIDATION.PRODUCT_TYPE.MIN_LENGTH,
      max: OVERVIEW_VALIDATION.PRODUCT_TYPE.MAX_LENGTH,
    });
  });
});

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
  VALIDATION,
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

  describe('when an empty object is provided', () => {
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

  describe('when an empty array is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with a validation error`, async () => {
      const mockPayload = [];

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

  describe('when empty entity arrays are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = { overview: [], counterparties: [], obligations: [], repaymentProfiles: [] };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview must be a non-empty object',
          'counterparties should not be empty',
          'obligations should not be empty',
          'repaymentProfiles should not be empty',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when null entities are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = { overview: null, counterparties: null, obligations: null, repaymentProfiles: null };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview should not be null or undefined',
          'overview must be a non-empty object',
          'nested property overview must be either object or array',
          'counterparties should not be null or undefined',
          'counterparties should not be empty',
          'counterparties must be an array',
          'nested property counterparties must be either object or array',
          'obligations should not be null or undefined',
          'obligations should not be empty',
          'obligations must be an array',
          'nested property obligations must be either object or array',
          'repaymentProfiles should not be null or undefined',
          'repaymentProfiles should not be empty',
          'repaymentProfiles must be an array',
          'nested property repaymentProfiles must be either object or array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when undefined entities are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = { overview: undefined, counterparties: undefined, obligations: undefined, repaymentProfiles: undefined };

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

  describe('when empty entity objects are provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = { overview: {}, counterparties: {}, obligations: {}, repaymentProfiles: {} };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'overview.currency should not be null or undefined',
          `overview.currency must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.CURRENCY.MIN_LENGTH} characters`,
          'overview.currency must be a string',
          'overview.dealId must be a string',
          `overview.dealId must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.DEAL_ID.MIN_LENGTH} characters`,
          'overview.dealId must match /^00\\d{8}$/ regular expression',
          'overview.effectiveDate should not be null or undefined',
          `overview.effectiveDate must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.EFFECTIVE_DATE.MIN_LENGTH} characters`,
          'overview.effectiveDate must be a string',
          'overview.endOfCoverDate should not be null or undefined',
          `overview.endOfCoverDate must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.END_OF_COVER_DATE.MIN_LENGTH} characters`,
          'overview.endOfCoverDate must be a string',
          'overview.expiryDate should not be null or undefined',
          `overview.expiryDate must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.EXPIRY_DATE.MIN_LENGTH} characters`,
          'overview.expiryDate must be a string',
          'overview.facilityAmount should not be null or undefined',
          `overview.facilityAmount must not be less than ${VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MIN}`,
          'overview.facilityAmount must be a number conforming to the specified constraints',
          'overview.facilityId must be a string',
          `overview.facilityId must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MIN_LENGTH} characters`,
          'overview.facilityId must match /^00\\d{8}$/ regular expression',
          'overview.isRevolving should not be null or undefined',
          'overview.isRevolving must be a boolean value',
          'overview.name should not be null or undefined',
          `overview.name must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MIN_LENGTH} characters`,
          'overview.name must be a string',
          'overview.obligorUrn should not be null or undefined',
          `overview.obligorUrn must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MIN_LENGTH} characters`,
          'overview.obligorUrn must be a number string',
          'overview.productType should not be null or undefined',
          `overview.productType must be longer than or equal to ${VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE.MIN_LENGTH} characters`,
          'overview.productType must be a string',
          `counterparties.counterpartyUrn should not be null or undefined`,
          `counterparties.counterpartyUrn must be longer than or equal to ${VALIDATION.COUNTERPARTY.COUNTERPARTY_URN.MIN_LENGTH} characters`,
          `counterparties.counterpartyUrn must be a string`,
          `counterparties.exitDate should not be null or undefined`,
          `counterparties.exitDate must be longer than or equal to ${VALIDATION.COUNTERPARTY.EXIT_DATE.MIN_LENGTH} characters`,
          `counterparties.exitDate must be a string`,
          `counterparties.roleId should not be null or undefined`,
          `counterparties.roleId must be longer than or equal to ${VALIDATION.COUNTERPARTY.ROLE_ID.MIN_LENGTH} characters`,
          `counterparties.roleId must be a string`,
          `counterparties.sharePercentage should not be null or undefined`,
          `counterparties.sharePercentage must not be greater than ${VALIDATION.COUNTERPARTY.SHARE_PERCENTAGE.MAX}`,
          `counterparties.sharePercentage must not be less than ${VALIDATION.COUNTERPARTY.SHARE_PERCENTAGE.MIN}`,
          `counterparties.sharePercentage must be a number conforming to the specified constraints`,
          `counterparties.startDate should not be null or undefined`,
          `counterparties.startDate must be longer than or equal to ${VALIDATION.COUNTERPARTY.START_DATE.MIN_LENGTH} characters`,
          `counterparties.startDate must be a string`,
          'obligations.currency should not be null or undefined',
          `obligations.currency must be longer than or equal to ${VALIDATION.OBLIGATION.CURRENCY.MIN_LENGTH} characters`,
          'obligations.currency must be a string',
          'obligations.effectiveDate should not be null or undefined',
          `obligations.effectiveDate must be longer than or equal to ${VALIDATION.OBLIGATION.EFFECTIVE_DATE.MIN_LENGTH} characters`,
          'obligations.effectiveDate must be a string',
          'obligations.maturityDate should not be null or undefined',
          `obligations.maturityDate must be longer than or equal to ${VALIDATION.OBLIGATION.MATURITY_DATE.MIN_LENGTH} characters`,
          'obligations.maturityDate must be a string',
          'obligations.obligationAmount should not be null or undefined',
          'obligations.obligationAmount must not be greater than 999999999999',
          `obligations.obligationAmount must not be less than ${VALIDATION.OBLIGATION.OBLIGATION_AMOUNT.MIN}`,
          'obligations.obligationAmount must be a number conforming to the specified constraints',
          'obligations.productSubtype should not be null or undefined',
          `obligations.productSubtype must be longer than or equal to ${VALIDATION.OBLIGATION.PRODUCT_SUBTYPE.MIN_LENGTH} characters`,
          'obligations.productSubtype must be a string',
          'repaymentProfiles.name should not be null or undefined',
          `repaymentProfiles.name must be longer than or equal to ${VALIDATION.REPAYMENT_PROFILE.NAME.MIN_LENGTH} characters`,
          'repaymentProfiles.name must be a string',
          'repaymentProfiles.allocations should not be null or undefined',
          'repaymentProfiles.allocations should not be empty',
          'repaymentProfiles.allocations must be an array',
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
      min: VALIDATION.FACILITY.OVERVIEW.CURRENCY.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.CURRENCY.MAX_LENGTH,
    });
  });

  describe('overview.dealId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'dealId',
      min: VALIDATION.FACILITY.OVERVIEW.DEAL_ID.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.DEAL_ID.MAX_LENGTH,
    });
  });

  describe('overview.effectiveDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'effectiveDate',
      min: VALIDATION.FACILITY.OVERVIEW.EFFECTIVE_DATE.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.EFFECTIVE_DATE.MAX_LENGTH,
    });
  });

  describe('overview.endOfCoverDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'endOfCoverDate',
      min: VALIDATION.FACILITY.OVERVIEW.END_OF_COVER_DATE.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.END_OF_COVER_DATE.MAX_LENGTH,
    });
  });

  describe('overview.expiryDate', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'expiryDate',
      min: VALIDATION.FACILITY.OVERVIEW.EXPIRY_DATE.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.EXPIRY_DATE.MAX_LENGTH,
    });
  });

  describe('overview.facilityAmount', () => {
    numberValidation({
      ...baseParams,
      fieldName: 'facilityAmount',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_AMOUNT.MIN,
    });
  });

  describe('overview.facilityId', () => {
    ukefIdValidation({
      ...baseParams,
      fieldName: 'facilityId',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.FACILITY_ID.MAX_LENGTH,
    });
  });

  describe('overview.isRevolving', () => {
    booleanValidation({ ...baseParams, fieldName: 'isRevolving' });
  });

  describe('overview.name', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'name',
      min: VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.FACILITY_NAME.MAX_LENGTH,
    });
  });

  describe('overview.obligorUrn', () => {
    numberStringValidation({
      ...baseParams,
      fieldName: 'obligorUrn',
      min: VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.OBLIGOR_URN.MAX_LENGTH,
    });
  });

  describe('overview.productType', () => {
    stringValidation({
      ...baseParams,
      fieldName: 'productType',
      min: VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE.MIN_LENGTH,
      max: VALIDATION.FACILITY.OVERVIEW.PRODUCT_TYPE.MAX_LENGTH,
    });
  });
});

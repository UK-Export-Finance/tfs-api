import { HttpStatus } from '@nestjs/common';
import AppConfig from '@ukef/config/app.config';
import { EXAMPLES, GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { arrayOfNestedObjectsNumberValidation, arrayOfNestedObjectsStringValidation, arrayOfObjectsStringValidation } from './assertions';

const {
  giftVersioning: { prefixAndVersion },
} = AppConfig();

const {
  PATH: { FACILITY },
  VALIDATION: { REPAYMENT_PROFILE: REPAYMENT_PROFILE_VALIDATION },
} = GIFT;

describe('POST /gift/facility - validation - repayment profiles', () => {
  const url = `/api/${prefixAndVersion}/gift${FACILITY}`;

  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    jest.resetAllMocks();

    nock.abortPendingRequests();
    nock.cleanAll();
  });

  const baseParams = {
    initialPayload: EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
    url,
  };

  describe('when an empty repayment profile object is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        repaymentProfiles: [{}],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'repaymentProfiles.0.name should not be null or undefined',
          `repaymentProfiles.0.name must be longer than or equal to ${REPAYMENT_PROFILE_VALIDATION.NAME.MIN_LENGTH} characters`,
          'repaymentProfiles.0.name must be a string',
          'repaymentProfiles.0.allocations should not be null or undefined',
          'repaymentProfiles.0.allocations should not be empty',
          'repaymentProfiles.0.allocations must be an array',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('name', () => {
    arrayOfObjectsStringValidation({
      ...baseParams,
      parentFieldName: 'repaymentProfiles',
      fieldName: 'name',
      min: REPAYMENT_PROFILE_VALIDATION.NAME.MIN_LENGTH,
      max: REPAYMENT_PROFILE_VALIDATION.NAME.MAX_LENGTH,
    });
  });

  describe('when a repayment has allocations as an empty array', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        repaymentProfiles: [
          {
            ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles[0],
            allocations: [],
          },
        ],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: ['repaymentProfiles.0.allocations should not be empty'],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when a repayment has allocations as sn empty object', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all required fields`, async () => {
      const mockPayload = {
        ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD,
        repaymentProfiles: [
          {
            ...EXAMPLES.GIFT.FACILITY_CREATION_PAYLOAD.repaymentProfiles[0],
            allocations: [{}],
          },
        ],
      };

      const { status, body } = await api.post(url, mockPayload);

      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'repaymentProfiles.0.allocations.0.amount should not be null or undefined',
          `repaymentProfiles.0.allocations.0.amount must not be less than ${REPAYMENT_PROFILE_VALIDATION.ALLOCATION.AMOUNT.MIN}`,
          'repaymentProfiles.0.allocations.0.amount must be a number conforming to the specified constraints',
          'repaymentProfiles.0.allocations.0.dueDate should not be null or undefined',
          `repaymentProfiles.0.allocations.0.dueDate must be longer than or equal to ${REPAYMENT_PROFILE_VALIDATION.ALLOCATION.DUE_DATE.MIN_LENGTH} characters`,
          'repaymentProfiles.0.allocations.0.dueDate must be a string',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('allocation.amount', () => {
    arrayOfNestedObjectsNumberValidation({
      ...baseParams,
      grandParentFieldName: 'repaymentProfiles',
      parentFieldName: 'allocations',
      fieldName: 'amount',
      min: REPAYMENT_PROFILE_VALIDATION.ALLOCATION.AMOUNT.MIN,
      max: null,
    });
  });

  describe('allocation.dueDate', () => {
    arrayOfNestedObjectsStringValidation({
      ...baseParams,
      grandParentFieldName: 'repaymentProfiles',
      parentFieldName: 'allocations',
      fieldName: 'dueDate',
      min: REPAYMENT_PROFILE_VALIDATION.ALLOCATION.DUE_DATE.MIN_LENGTH,
      max: REPAYMENT_PROFILE_VALIDATION.ALLOCATION.DUE_DATE.MAX_LENGTH,
    });
  });
});

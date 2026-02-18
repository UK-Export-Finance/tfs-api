import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { dateStringValidation, numberValidation } from './assertions';
import { apimFacilityAmendmentUrl } from './test-helpers';

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  VALIDATION,
} = GIFT;

describe('POST /gift/facility/:facilityId/amendment - validation - amendmentData', () => {
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

  describe.each([AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT])(`when amendmentType is %s`, (amendmentType: string) => {
    describe('when an empty object is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType,
          amendmentData: {},
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [
            'amendmentData.amount should not be null or undefined',
            `amendmentData.amount must not be greater than ${VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX}`,
            `amendmentData.amount must not be less than ${VALIDATION.FACILITY.AMENDMENT.AMOUNT.MIN}`,
            'amendmentData.amount must be a number conforming to the specified constraints',
            'amendmentData.date should not be null or undefined',
            'amendmentData.date must be a valid ISO 8601 date string',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an empty array is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType,
          amendmentData: [],
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData must be an object'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when amount is provided, but date is not', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType,
          amendmentData: {
            amount: 100,
          },
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData.date should not be null or undefined', 'amendmentData.date must be a valid ISO 8601 date string'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when date is provided, but amount is not', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType,
          amendmentData: {
            date: '2023-01-01',
          },
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [
            'amendmentData.amount should not be null or undefined',
            `amendmentData.amount must not be greater than ${VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX}`,
            `amendmentData.amount must not be less than ${VALIDATION.FACILITY.AMENDMENT.AMOUNT.MIN}`,
            'amendmentData.amount must be a number conforming to the specified constraints',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an invalid field is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType,
          amendmentData: {
            ...GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
            invalidField: true,
          },
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData.property invalidField should not exist'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('amount', () => {
      numberValidation({
        fieldName: 'amount',
        initialPayload: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD,
        min: VALIDATION.FACILITY.AMENDMENT.AMOUNT.MIN,
        max: VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX,
        parentFieldName: 'amendmentData',
        url: apimFacilityAmendmentUrl,
      });
    });

    describe('date', () => {
      dateStringValidation({
        fieldName: 'date',
        initialPayload: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD,
        parentFieldName: 'amendmentData',
        url: apimFacilityAmendmentUrl,
      });
    });
  });

  describe(`when amendmentType is ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    describe('when an empty object is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: {},
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData.expiryDate should not be null or undefined', 'amendmentData.expiryDate must be a valid ISO 8601 date string'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an empty array is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: [],
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData must be an object'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an invalid field is provided', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: {
            ...GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
            invalidField: true,
          },
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: ['amendmentData.property invalidField should not exist'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('expiryDate', () => {
      dateStringValidation({
        fieldName: 'expiryDate',
        initialPayload: {
          amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.REPLACE_EXPIRY_DATE,
        },
        parentFieldName: 'amendmentData',
        url: apimFacilityAmendmentUrl,
      });
    });
  });
});

import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { amendmentTypeStringValidation } from './assertions';
import { amendmentTypeValidationMessage, apimFacilityAmendmentUrl } from './test-helpers';

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  VALIDATION,
} = GIFT;

describe('POST /gift/facility/:facilityId/amendment - validation', () => {
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
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = {};

      // Act
      const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'amendmentType should not be null or undefined',
          amendmentTypeValidationMessage,
          `amendmentType must be longer than or equal to ${VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH} characters`,
          'amendmentType must be a string',
          'amendmentData should not be null or undefined',
          'amendmentData must be an object',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an empty array is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = [];

      // Act
      const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'amendmentType should not be null or undefined',
          amendmentTypeValidationMessage,
          `amendmentType must be longer than or equal to ${VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH} characters`,
          'amendmentType must be a string',
          'amendmentData should not be null or undefined',
          'amendmentData must be an object',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an invalid field is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = { invalidField: true };

      // Act
      const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: [
          'property invalidField should not exist',
          'amendmentType should not be null or undefined',
          amendmentTypeValidationMessage,
          `amendmentType must be longer than or equal to ${VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH} characters`,
          'amendmentType must be a string',
          'amendmentData should not be null or undefined',
          'amendmentData must be an object',
        ],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('amendmentType', () => {
    amendmentTypeStringValidation({
      url: apimFacilityAmendmentUrl,
      initialPayload: {},
      min: VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH,
      max: VALIDATION.FACILITY.AMENDMENT_TYPE.MAX_LENGTH,
    });

    describe('when an unsupported or invalid amendmentType is provided', () => {
      it.each([
        'A',
        'InvalidAmendmentType',
        'Example',
        'Test',
        '123',
        `${AMEND_FACILITY_INCREASE_AMOUNT}x`,
        `${AMEND_FACILITY_DECREASE_AMOUNT}y`,
        `${AMEND_FACILITY_REPLACE_EXPIRY_DATE}z`,
      ])(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async (invalidAmendmentType: string) => {
        // Arrange
        const mockPayload = {
          amendmentData: {},
          amendmentType: invalidAmendmentType,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [amendmentTypeValidationMessage],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when an unsupported or invalid amendmentType is provided and amendmentData is populated', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors - all amendmentData fields invalid`, async () => {
        // Arrange
        const mockPayload = {
          amendmentType: 'InvalidAmendmentType',
          amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
        };

        // Act
        const { status, body } = await api.post(apimFacilityAmendmentUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [amendmentTypeValidationMessage, 'amendmentData.property amount should not exist', 'amendmentData.property date should not exist'],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });
  });
});

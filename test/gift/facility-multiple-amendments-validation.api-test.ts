import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';
import { Api } from '@ukef-test/support/api';
import nock from 'nock';

import { amendmentTypeValidationMessage, apimFacilityMultipleAmendmentsWithoutQueueUrl } from './test-helpers';

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
  VALIDATION,
} = GIFT;

describe('POST /gift/facility/:facilityId/multiple-amendments/without-queue - validation', () => {
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
      const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: ['amendments should not be null or undefined', 'amendments must be an array'],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an empty array is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = {
        amendments: [],
      };

      // Act
      const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: ['amendments must contain at least 1 elements'],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('when an invalid field is provided', () => {
    it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
      // Arrange
      const mockPayload = {
        amendments: [
          {
            amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
            amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
          },
        ],
        invalidField: 'invalidValue',
      };

      // Act
      const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

      // Assert
      expect(status).toBe(HttpStatus.BAD_REQUEST);

      const expected = {
        error: 'Bad Request',
        message: ['property invalidField should not exist'],
        statusCode: HttpStatus.BAD_REQUEST,
      };

      expect(body).toStrictEqual(expected);
    });
  });

  describe('amendments array', () => {
    describe('when an amendment has an empty object', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendments: [{}],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [
            'amendments.0.amendmentType should not be null or undefined',
            amendmentTypeValidationMessage,
            `amendments.0.amendmentType must be longer than or equal to ${VALIDATION.FACILITY.AMENDMENT_TYPE.MIN_LENGTH} characters`,
            'amendments.0.amendmentType must be a string',
            'amendments.0.amendmentData should not be null or undefined',
            'amendments.0.amendmentData must be an object',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe('when multiple amendments have validation errors', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors for all invalid amendments`, async () => {
        // Arrange
        const mockPayload = {
          amendments: [
            {
              amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
              amendmentData: {
                amount: 150,
              },
            },
            {
              amendmentType: 'INVALID_TYPE',
              amendmentData: {},
            },
          ],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toContain('amendments.0.amendmentData.date should not be null or undefined');
        expect(body.message).toContain(
          `amendments.1.amendmentType must be one of the following values: ${AMEND_FACILITY_INCREASE_AMOUNT}, ${AMEND_FACILITY_DECREASE_AMOUNT}, ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`,
        );
      });
    });

    describe('when an amendment has an unsupported or invalid amendmentType', () => {
      it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
        // Arrange
        const mockPayload = {
          amendments: [
            {
              amendmentType: 'INVALID_TYPE',
              amendmentData: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
            },
          ],
        };

        // Act
        const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

        // Assert
        expect(status).toBe(HttpStatus.BAD_REQUEST);

        const expected = {
          error: 'Bad Request',
          message: [
            `amendments.0.amendmentType must be one of the following values: ${AMEND_FACILITY_INCREASE_AMOUNT}, ${AMEND_FACILITY_DECREASE_AMOUNT}, ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`,
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        };

        expect(body).toStrictEqual(expected);
      });
    });

    describe.each([AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_DECREASE_AMOUNT])(`when amendmentType is %s`, (amendmentType: string) => {
      describe('amount', () => {
        describe('when amount has more than 2 decimal places', () => {
          it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
            // Arrange
            const mockPayload = {
              amendments: [
                {
                  amendmentType,
                  amendmentData: {
                    amount: 232000.255,
                    date: GIFT_EXAMPLES.FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT.date,
                  },
                },
              ],
            };

            // Act
            const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

            // Assert
            expect(status).toBe(HttpStatus.BAD_REQUEST);
            expect(body.message).toContain(
              `amendments.0.amendmentData.amount must not have more than ${VALIDATION.FACILITY.AMENDMENT.AMOUNT.MAX_DECIMAL_PLACES} decimal places`,
            );
          });
        });
      });

      describe('date', () => {
        describe('when date is not a valid ISO date string', () => {
          it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
            // Arrange
            const mockPayload = {
              amendments: [
                {
                  amendmentType,
                  amendmentData: {
                    amount: 150,
                    date: 'invalid-date',
                  },
                },
              ],
            };

            // Act
            const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

            // Assert
            expect(status).toBe(HttpStatus.BAD_REQUEST);
            expect(body.message).toContain('amendments.0.amendmentData.date must be a valid ISO 8601 date string');
          });
        });
      });
    });

    describe(`when amendmentType is ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
      describe('expiryDate', () => {
        describe('when expiryDate is not a valid ISO date string', () => {
          it(`should return a ${HttpStatus.BAD_REQUEST} response with validation errors`, async () => {
            // Arrange
            const mockPayload = {
              amendments: [
                {
                  amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
                  amendmentData: {
                    expiryDate: 'invalid-date',
                  },
                },
              ],
            };

            // Act
            const { status, body } = await api.post(apimFacilityMultipleAmendmentsWithoutQueueUrl, mockPayload);

            // Assert
            expect(status).toBe(HttpStatus.BAD_REQUEST);
            expect(body.message).toContain('amendments.0.amendmentData.expiryDate must be a valid ISO 8601 date string');
          });
        });
      });
    });
  });
});

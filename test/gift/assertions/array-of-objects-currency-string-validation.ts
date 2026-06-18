import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { AUD } from '@ukef/constants/currencies.constant';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

const UNSUPPORTED_CURRENCY = AUD;

const { API_RESPONSE_MESSAGES, VALIDATION } = GIFT;

/**
 * Validation tests for an array of objects - currency string field with invalid values
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {string} url: The URL the tests will call.
 */
export const arrayOfObjectsCurrencyStringValidation = ({ initialPayload, parentFieldName, url }) => {
  let api: Api;

  const fieldName = 'currency';
  const min = VALIDATION.CURRENCY.MIN_LENGTH;
  const max = VALIDATION.CURRENCY.MAX_LENGTH;

  const payloadParams = { initialPayload, fieldName, parentFieldName };

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  describe(`when ${fieldName} is null`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: null });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: undefined });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty array`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: [] });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, true`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: true });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, false`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: false });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a number, 0`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: 0 });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a number, 1`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: 1 });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${parentFieldName}.0.${fieldName} must be a string`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty string`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: '' });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    let mockPayload;

    const value = 'a'.repeat(min - 1);

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    let mockPayload;

    const value = 'a'.repeat(max + 1);

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} must be shorter than or equal to ${max} characters`,
        `${parentFieldName}.1.${fieldName} must be shorter than or equal to ${max} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('async validation - when the provided currency is not supported', () => {
    let mockPayload;

    const value = UNSUPPORTED_CURRENCY;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
    });

    it(`should return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct body.message', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = API_RESPONSE_MESSAGES.ASYNC_FACILITY_VALIDATION_ERRORS;

      expect(body.message).toStrictEqual(expected);
    });

    it('should return the correct body.validationErrors', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [
        `${parentFieldName}.0.${fieldName} is not supported - ${UNSUPPORTED_CURRENCY}`,
        `${parentFieldName}.1.${fieldName} is not supported - ${UNSUPPORTED_CURRENCY}`,
      ];

      expect(body.validationErrors).toStrictEqual(expected);
    });
  });
};

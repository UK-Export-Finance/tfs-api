import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a nested array of objects - date string field with invalid values
 * @param {string} fieldName: The name of a field. E.g, email
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {string} grandParentFieldName: The name of a parent field. E.g grandParentObject
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {string} url: The URL the tests will call.
 */
export const arrayOfNestedObjectsDateStringValidation = ({ fieldName, grandParentFieldName, parentFieldName, initialPayload, url }) => {
  let api: Api;

  const min = GIFT.VALIDATION.DATE_STRING.MIN_LENGTH;
  const max = GIFT.VALIDATION.DATE_STRING.MAX_LENGTH;

  const payloadParams = { initialPayload, fieldName, grandParentFieldName, parentFieldName };

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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
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
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a valid ISO 8601 date string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a valid ISO 8601 date string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

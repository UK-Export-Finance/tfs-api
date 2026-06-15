import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a nested, optional boolean field with invalid values
 * When the field is provided, it must be a boolean. When omitted, it is valid.
 * @param {string} fieldName: The name of a field. E.g, updateObligationDates
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {string} parentFieldName: The name of a parent field. E.g amendmentData
 * @param {string} url: The URL the tests will call.
 */
export const optionalBooleanValidation = ({ fieldName, initialPayload, parentFieldName, url }) => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const fieldPath = `${parentFieldName}.${fieldName}`;

  const mockPayload = generatePayload({ initialPayload, fieldName, parentFieldName });

  describe(`when ${fieldName} is an empty array`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = [];
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
      const expected = [`${fieldPath} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = 'true';
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
      const expected = [`${fieldPath} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a number`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = 1;
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
      const expected = [`${fieldPath} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an object`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = {};
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
      const expected = [`${fieldPath} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is true`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = true;
    });

    it(`should not return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      expect(response.status).not.toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`when ${fieldName} is false`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = false;
    });

    it(`should not return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      expect(response.status).not.toBe(HttpStatus.BAD_REQUEST);
    });
  });
};

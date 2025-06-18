import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a number string field with invalid values
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {Number} min: The minimum length
 * @param {Number} max: The maximum length
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const numberStringValidation = ({ fieldName, initialPayload, min, max, parentFieldName, url }) => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const fieldPath = `${parentFieldName}.${fieldName}`;

  const mockPayload = generatePayload({ initialPayload, fieldName, parentFieldName });

  describe(`when ${fieldName} is null`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = null;
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
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must be longer than or equal to ${min} characters`,
        `${fieldPath} must be a number string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = undefined;
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
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must be longer than or equal to ${min} characters`,
        `${fieldPath} must be a number string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

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
      const expected = [`${fieldPath} must be longer than or equal to ${min} characters`, `${fieldPath} must be a number string`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, true`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = true;
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
        `${fieldPath} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${fieldPath} must be a number string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, false`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = false;
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
      const expected = [`${fieldPath} must be longer than or equal to ${min} characters`, `${fieldPath} must be a number string`];

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
      const expected = [
        `${fieldPath} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${fieldPath} must be a number string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty string`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = '';
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
      const expected = [`${fieldPath} must be longer than or equal to ${min} characters`, `${fieldPath} must be a number string`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string, but not a number`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = 'not a number';
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
      const expected = [`${fieldPath} must be shorter than or equal to ${max} characters`, `${fieldPath} must be a number string`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = '1'.repeat(min - 1);
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
      const expected = [`${fieldPath} must be longer than or equal to ${min} characters`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = '1'.repeat(max + 1);
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
      const expected = [`${fieldPath} must be shorter than or equal to ${max} characters`];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

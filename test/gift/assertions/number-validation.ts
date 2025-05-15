import { VALIDATION } from '@ukef/constants/gift/validation.constant';
import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a number field with invalid values
 * @param {String} fieldName: The name of a field. E.g, amount
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {Number} min: The minimum
 * @param {Number} max: The maximum
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const numberValidation = ({ fieldName, initialPayload, min, max, parentFieldName, url }) => {
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

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = undefined;
    });

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty array`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = [];
    });

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, true`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = true;
    });

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, false`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = false;
    });

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = '';
    });

    it('should return a 400 response', async () => {
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
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = min - 1;
    });

    it('should return a 400 response', async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [`${fieldPath} must not be less than ${min}`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    beforeAll(() => {
      // Arrange

      let value = max + 1;

      if (max === VALIDATION.MAX_MONETARY_AMOUNT) {
        value = max + 2;
      }

      mockPayload[`${parentFieldName}`][`${fieldName}`] = value;
    });

    it('should return a 400 response', async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      // Act
      const { body } = await api.post(url, mockPayload);

      // Assert
      const expected = [`${fieldPath} must not be greater than ${max}`];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

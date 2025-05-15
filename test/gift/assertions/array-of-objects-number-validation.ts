import { VALIDATION } from '@ukef/constants/gift/validation.constant';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for an array of objects - number field with invalid values
 * @param {String} fieldName: The name of a field. E.g, amount
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {Number} min: The minimum
 * @param {Number} max: The maximum
 * @param {String} url: The URL the tests will call.
 */
export const arrayOfObjectsNumberValidation = ({ fieldName, parentFieldName, initialPayload, min, max, url }) => {
  let api: Api;

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
        `${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
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
        `${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
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
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
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
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
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
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: '' });
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
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    let mockPayload;

    const value = min - 1;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
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
      const expected = [`${parentFieldName}.0.${fieldName} must not be less than ${min}`, `${parentFieldName}.1.${fieldName} must not be less than ${min}`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    let mockPayload;

    let value = max + 1;

    if (max === VALIDATION.MAX_MONETARY_AMOUNT) {
      value = max + 2;
    }

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
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
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

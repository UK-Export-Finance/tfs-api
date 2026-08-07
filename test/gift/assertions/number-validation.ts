import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a number field with invalid values
 * @param {string} fieldName: The name of a field. E.g, amount
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {number} min: The minimum
 * @param {number} max: The maximum
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {string} url: The URL the tests will call.
 * @param {boolean} [requireInteger=false]: Whether integer validation is expected for this field.
 */
export const numberValidation = ({ fieldName, initialPayload, min, max, parentFieldName, url, requireInteger = false }) => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const fieldPath = `${parentFieldName}.${fieldName}`;
  const integerValidationMessage = `${fieldPath} must be an integer number`;

  /**
   * Appends the integer-validation message when integer validation is enabled for the field.
   * This keeps expected message construction centralized across all number-validation scenarios.
   */
  const withIntegerMessage = (messages: string[]): string[] => (requireInteger ? [...messages, integerValidationMessage] : messages);

  /**
   * Asserts validation messages.
   * When integer validation is enabled, message order is compared order-insensitively because
   * class-validator does not guarantee deterministic ordering across constraint decorators.
   */
  const assertMessages = (actual: string[], expected: string[]) => {
    if (requireInteger) {
      expect([...actual].sort()).toStrictEqual([...expected].sort());
      return;
    }

    expect(actual).toStrictEqual(expected);
  };

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
      const expected = withIntegerMessage([
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
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
      const expected = withIntegerMessage([
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
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
      const expected = withIntegerMessage([
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
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
      const expected = withIntegerMessage([
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
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
      const expected = withIntegerMessage([
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
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
      const expected = withIntegerMessage([
        `${fieldPath} must not be greater than ${max}`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ]);

      assertMessages(body.message, expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    beforeAll(() => {
      // Arrange
      mockPayload[`${parentFieldName}`][`${fieldName}`] = min - 1;
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
      const expected = [`${fieldPath} must not be less than ${min}`];

      assertMessages(body.message, expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    beforeAll(() => {
      // Arrange
      const value = max + 1;

      mockPayload[`${parentFieldName}`][`${fieldName}`] = value;
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
      const expected = [`${fieldPath} must not be greater than ${max}`];

      assertMessages(body.message, expected);
    });
  });
};

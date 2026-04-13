import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

type ArrayOfObjectsNumberValidationParams = {
  fieldName: string;
  parentFieldName: string;
  initialPayload: object;
  min?: number;
  max?: number;
  url: string;
};

/**
 * Asserts that the received validation messages match the expected validation messages, regardless of order.
 * @param {string[]} received - The array of validation messages received from the API response.
 * @param {string[]} expected - The array of expected validation messages to compare against.
 */
const assertValidationMessages = (received: string[], expected: string[]) => {
  expect([...received].sort()).toStrictEqual([...expected].sort());
};

/**
 * Validation tests for an array of objects - number field with invalid values
 * @param {string} fieldName: The name of a field. E.g, amount
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {number} min: The minimum
 * @param {number} max: The maximum
 * @param {string} url: The URL the tests will call.
 */
export const arrayOfObjectsNumberValidation = ({
  fieldName,
  parentFieldName,
  initialPayload,
  min = null,
  max = null,
  url,
}: ArrayOfObjectsNumberValidationParams) => {
  let api: Api;

  const payloadParams = { initialPayload, fieldName, parentFieldName };

  /**
   * Builds the expected validation messages for invalid number values in each array item.
   *
   * Messages are generated for indexes 0 and 1 using the current field and parent field names.
   * The required message is optional, while min/max and number-type messages depend on helper
   * configuration and function inputs.
   *
   * @param options - Optional flags that control which messages are included.
   * @param options.includeRequiredError - Includes "should not be null or undefined" for each array item when true.
   * @returns A flat array of expected validation messages for both array objects.
   */
  const buildTypeErrorMessages = ({ includeRequiredError = false }: { includeRequiredError?: boolean } = {}) =>
    [0, 1].flatMap((index) => {
      const prefix = `${parentFieldName}.${index}.${fieldName}`;
      const messages: string[] = [];

      if (includeRequiredError) {
        messages.push(`${prefix} should not be null or undefined`);
      }

      if (min !== null) {
        messages.push(`${prefix} must not be less than ${min}`);
      }

      if (max !== null) {
        messages.push(`${prefix} must not be greater than ${max}`);
      }

      messages.push(`${prefix} must be a number conforming to the specified constraints`);

      return messages;
    });

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  describe(`when ${fieldName} is null`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages({ includeRequiredError: true }));
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages({ includeRequiredError: true }));
    });
  });

  describe(`when ${fieldName} is an empty array`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages());
    });
  });

  describe(`when ${fieldName} is a boolean, true`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages());
    });
  });

  describe(`when ${fieldName} is a boolean, false`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages());
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    let mockPayload;

    beforeAll(() => {
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
      assertValidationMessages(body.message, buildTypeErrorMessages());
    });
  });

  if (min !== null) {
    describe(`when ${fieldName} is below the minimum`, () => {
      let mockPayload;
      const value = min - 1;

      beforeAll(() => {
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
        const expected = [`${parentFieldName}.0.${fieldName} must not be less than ${min}`, `${parentFieldName}.1.${fieldName} must not be less than ${min}`];

        assertValidationMessages(body.message, expected);
      });
    });
  }

  if (max !== null) {
    describe(`when ${fieldName} is above the maximum`, () => {
      let mockPayload;
      const value = max + 1;

      beforeAll(() => {
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
          `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
          `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        ];

        assertValidationMessages(body.message, expected);
      });
    });
  }
};

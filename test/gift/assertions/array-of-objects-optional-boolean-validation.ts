import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for an array of objects - optional boolean field.
 * When provided, it must be a boolean. When omitted, it is valid.
 */
export const arrayOfObjectsOptionalBooleanValidation = ({ fieldName, initialPayload, parentFieldName, url }) => {
  let api: Api;

  const payloadParams = { initialPayload, fieldName, parentFieldName };

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
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
      const expected = [`${parentFieldName}.0.${fieldName} must be a boolean value`, `${parentFieldName}.1.${fieldName} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: 'true' });
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
      const expected = [`${parentFieldName}.0.${fieldName} must be a boolean value`, `${parentFieldName}.1.${fieldName} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a number`, () => {
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
      const expected = [`${parentFieldName}.0.${fieldName} must be a boolean value`, `${parentFieldName}.1.${fieldName} must be a boolean value`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is true`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: true });
    });

    it(`should not return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      expect(response.status).not.toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe(`when ${fieldName} is false`, () => {
    let mockPayload;

    beforeAll(() => {
      // Arrange
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: false });
    });

    it(`should not return a ${HttpStatus.BAD_REQUEST} response`, async () => {
      // Act
      const response = await api.post(url, mockPayload);

      // Assert
      expect(response.status).not.toBe(HttpStatus.BAD_REQUEST);
    });
  });
};

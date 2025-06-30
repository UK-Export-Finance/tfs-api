import { HttpStatus } from '@nestjs/common';
import { GIFT } from '@ukef/constants';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for an array of objects - sharePercentage field with invalid values
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} url: The URL the tests will call.
 */
export const arrayOfObjectsSharePercentageValidation = ({ parentFieldName, initialPayload, url }) => {
  let api: Api;

  const fieldName = 'sharePercentage';
  const min = GIFT.VALIDATION.COUNTERPARTY.SHARE_PERCENTAGE.MIN;
  const max = GIFT.VALIDATION.COUNTERPARTY.SHARE_PERCENTAGE.MAX;

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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    let mockPayload;

    const value = max + 1;

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
        `${parentFieldName}.0.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a provided as a number, at least ${min} and not greater than ${max}`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

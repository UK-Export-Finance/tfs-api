import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { amendmentTypeValidationMessage } from '../test-helpers';
import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for an "amendmentType" string field with invalid values
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {number} min: The minimum length
 * @param {number} max: The maximum length
 * @param {string} url: The URL the tests will call.
 */
export const amendmentTypeStringValidation = ({ initialPayload, min, max, url }) => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const mockPayload = generatePayload({ initialPayload, fieldName: 'amendmentType' });

  describe('when amendmentType is null', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = null;
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
        'amendmentType should not be null or undefined',
        amendmentTypeValidationMessage,
        `amendmentType must be longer than or equal to ${min} characters`,
        'amendmentType must be a string',
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is undefined', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = undefined;
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
        'amendmentType should not be null or undefined',
        amendmentTypeValidationMessage,
        `amendmentType must be longer than or equal to ${min} characters`,
        'amendmentType must be a string',
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is an empty array', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = [];
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be longer than or equal to ${min} characters`, 'amendmentType must be a string'];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is a boolean, true', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = true;
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
        amendmentTypeValidationMessage,
        `amendmentType must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        'amendmentType must be a string',
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is a boolean, false', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = false;
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be longer than or equal to ${min} characters`, 'amendmentType must be a string'];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is a number, 0', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = 0;
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be longer than or equal to ${min} characters`, 'amendmentType must be a string'];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is a number, 1', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = 1;
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
        amendmentTypeValidationMessage,
        `amendmentType must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        'amendmentType must be a string',
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is an empty string', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = '';
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be longer than or equal to ${min} characters`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is below the minimum', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = 'a'.repeat(min - 1);
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be longer than or equal to ${min} characters`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe('when amendmentType is above the maximum', () => {
    beforeAll(() => {
      // Arrange
      mockPayload.amendmentType = 'a'.repeat(max + 1);
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
      const expected = [amendmentTypeValidationMessage, `amendmentType must be shorter than or equal to ${max} characters`];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

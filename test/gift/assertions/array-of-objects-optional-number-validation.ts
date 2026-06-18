import { HttpStatus } from '@nestjs/common';
import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

type ArrayOfObjectsOptionalNumberValidationParams = {
  fieldName: string;
  parentFieldName: string;
  initialPayload: object;
  min?: number;
  max?: number;
  url: string;
};

/**
 * Validation tests for an array of objects - optional number field with invalid values
 * @param {string} fieldName: The name of a field. E.g, amount
 * @param {string} parentFieldName: The name of a parent field. E.g parentObject
 * @param {object} initialPayload: The payload to use before adding a field value
 * @param {number} min: The minimum
 * @param {number} max: The maximum
 * @param {string} url: The URL the tests will call.
 */
export const arrayOfObjectsOptionalNumberValidation = ({
  fieldName,
  parentFieldName,
  initialPayload,
  min = null,
  max = null,
  url,
}: ArrayOfObjectsOptionalNumberValidationParams) => {
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
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect([...body.message].sort()).toStrictEqual([...expected].sort());
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
      const expected = [
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect([...body.message].sort()).toStrictEqual([...expected].sort());
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
      const expected = [
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect([...body.message].sort()).toStrictEqual([...expected].sort());
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
      const expected = [
        `${parentFieldName}.0.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.0.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.0.${fieldName} must be a number conforming to the specified constraints`,
        `${parentFieldName}.1.${fieldName} must not be less than ${min}`,
        `${parentFieldName}.1.${fieldName} must not be greater than ${max}`,
        `${parentFieldName}.1.${fieldName} must be a number conforming to the specified constraints`,
      ];

      expect([...body.message].sort()).toStrictEqual([...expected].sort());
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

        expect([...body.message].sort()).toStrictEqual([...expected].sort());
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

        expect([...body.message].sort()).toStrictEqual([...expected].sort());
      });
    });
  }
};

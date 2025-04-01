import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a number field with invalid values
 * @param {String} fieldName: The name of a field. E.g, amount
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {Number} min: The minimium length
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const numberValidation = ({ fieldName, initialPayload, min, parentFieldName, url }) => {
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
      mockPayload[`${parentFieldName}`][`${fieldName}`] = null;
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = undefined;
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${fieldPath} should not be null or undefined`,
        `${fieldPath} must not be less than ${min}`,
        `${fieldPath} must be a number conforming to the specified constraints`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty array`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = [];
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [`${fieldPath} must not be less than ${min}`, `${fieldPath} must be a number conforming to the specified constraints`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, true`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = true;
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [`${fieldPath} must not be less than ${min}`, `${fieldPath} must be a number conforming to the specified constraints`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a boolean, false`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = false;
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [`${fieldPath} must not be less than ${min}`, `${fieldPath} must be a number conforming to the specified constraints`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a string`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = '';
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [`${fieldPath} must not be less than ${min}`, `${fieldPath} must be a number conforming to the specified constraints`];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    beforeAll(() => {
      mockPayload[`${parentFieldName}`][`${fieldName}`] = 'a'.repeat(min - 1);
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [`${fieldPath} must not be less than ${min}`, `${fieldPath} must be a number conforming to the specified constraints`];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

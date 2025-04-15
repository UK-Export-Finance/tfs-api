import { Api } from '@ukef-test/support/api';

import { generatePayloadArrayOfObjects } from './generate-payload';
import { assert400Response } from './response-assertion';

/**
 * Validation tests for a nested array of objects - string field with invalid values
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} grandParentFieldName: The name of a parent field. E.g grandParentObject
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {Number} min: The minimum length
 * @param {Number} max: The maximum length
 * @param {String} url: The URL the tests will call.
 */
export const arrayOfNestedObjectsStringValidation = ({ fieldName, grandParentFieldName = '', parentFieldName, initialPayload, min, max, url }) => {
  let api: Api;

  const payloadParams = { initialPayload, fieldName, grandParentFieldName, parentFieldName };

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

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is undefined`, () => {
    let mockPayload;

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: undefined });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} should not be null or undefined`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty array`, () => {
    let mockPayload;

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: [] });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${max} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${max} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is a number, 1`, () => {
    let mockPayload;

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: 1 });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be a string`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} and shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be a string`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is an empty string`, () => {
    let mockPayload;

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value: '' });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is below the minimum`, () => {
    let mockPayload;

    const value = 'a'.repeat(min - 1);

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be longer than or equal to ${min} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be longer than or equal to ${min} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });

  describe(`when ${fieldName} is above the maximum`, () => {
    let mockPayload;

    const value = 'a'.repeat(max + 1);

    beforeAll(() => {
      mockPayload = generatePayloadArrayOfObjects({ ...payloadParams, value });
    });

    it('should return a 400 response', async () => {
      const response = await api.post(url, mockPayload);

      assert400Response(response);
    });

    it('should return the correct error messages', async () => {
      const { body } = await api.post(url, mockPayload);

      const expected = [
        `${grandParentFieldName}.0.${parentFieldName}.0.${fieldName} must be shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.0.${parentFieldName}.1.${fieldName} must be shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.0.${fieldName} must be shorter than or equal to ${max} characters`,
        `${grandParentFieldName}.1.${parentFieldName}.1.${fieldName} must be shorter than or equal to ${max} characters`,
      ];

      expect(body.message).toStrictEqual(expected);
    });
  });
};

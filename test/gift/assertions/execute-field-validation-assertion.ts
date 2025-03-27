import { Api } from '@ukef-test/support/api';

import { generatePayload } from './generate-payload';

/**
 * Execute a field validation assertion
 * @param {String} expectedMessage: The expected validation message
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {Array<any>} invalidValues: Invalid values to assert against the field
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const executeFieldValidationAssertion = ({ expectedMessage, fieldName, initialPayload, invalidValues = [], parentFieldName, url }) => {
  let api: Api;

  beforeAll(async () => {
    api = await Api.create();
  });

  afterAll(async () => {
    await api.destroy();
  });

  const fieldPath = `${parentFieldName}.${fieldName}`;

  describe.each(invalidValues)(fieldPath, (value) => {
    describe(`when ${fieldName} is ${value}`, () => {
      it('should return a 400 response with a validation error', async () => {
        const mockPayload = generatePayload({
          initialPayload,
          fieldName,
          parentFieldName,
          value,
        });

        const { status, body } = await api.post(url, mockPayload);

        expect(status).toBe(400);

        const expected = {
          error: 'Bad Request',
          message: [`${fieldPath} ${expectedMessage}`],
          statusCode: 400,
        };

        expect(body).toStrictEqual(expected);
      });
    });
  });
};

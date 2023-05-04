import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { prepareModifiedRequest } from '@ukef-test/support/helpers/request-field-validation-helper';
import request from 'supertest';

interface RequiredNonNegativeFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  required?: boolean;
  enum?: any;
  generateFieldValueThatDoesNotMatchEnum?: () => number;
  validRequestBody: RequestBodyItem[] | RequestBodyItem;
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withNonNegativeNumberFieldValidationApiTests<RequestBodyItem>({
  fieldName: fieldNameSymbol,
  required,
  enum: theEnum,
  generateFieldValueThatDoesNotMatchEnum,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: RequiredNonNegativeFieldValidationApiTestOptions<RequestBodyItem>): void {
  const fieldName = fieldNameSymbol.toString();
  const valueGenerator = new RandomValueGenerator();

  const requestIsAnArray = Array.isArray(validRequestBody);
  const requestBodyItem = requestIsAnArray ? validRequestBody[0] : validRequestBody;

  required = required ?? true;

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    if (required) {
      it(`returns a 400 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutField } = requestBodyItem;
        const preparedRequestWithoutField = prepareModifiedRequest(requestIsAnArray, requestWithoutField);

        const { status, body } = await makeRequest(preparedRequestWithoutField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must not be less than 0`, `${fieldName} should not be empty`]),
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 2xx response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutField } = requestBodyItem;
        const preparedRequestWithoutField = prepareModifiedRequest(requestIsAnArray, requestWithoutField);

        const { status } = await makeRequest(preparedRequestWithoutField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }

    it(`returns a 400 response if ${fieldName} is less than 0`, async () => {
      const requestWithNegativeField = { ...requestBodyItem, [fieldNameSymbol]: -0.01 };
      const preparedRequestWithNegativeField = prepareModifiedRequest(requestIsAnArray, requestWithNegativeField);

      const { status, body } = await makeRequest(preparedRequestWithNegativeField);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must not be less than 0`]),
        statusCode: 400,
      });
    });

    if (theEnum && generateFieldValueThatDoesNotMatchEnum) {
      // Numeric enums needs filter to get possible values.
      const possibleValues = Object.values(theEnum).filter((value) => !isNaN(Number(value)));

      it(`returns a 2xx response if ${fieldName} does match the enum`, async () => {
        const requestWithInvalidField = {
          ...validRequestBody[0],
          [fieldNameSymbol]: possibleValues[valueGenerator.integer({ min: 0, max: possibleValues.length - 1 })],
        };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });

      it(`returns a 400 response if ${fieldName} does not match the enum`, async () => {
        const requestWithInvalidField = { ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueThatDoesNotMatchEnum() };

        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be one of the following values: ${possibleValues.join(', ')}`]),
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 2xx response if ${fieldName} is 0`, async () => {
        const requestWithZeroField = { ...requestBodyItem, [fieldNameSymbol]: 0 };
        const preparedRequestWithZeroField = prepareModifiedRequest(requestIsAnArray, requestWithZeroField);

        const { status } = await makeRequest(preparedRequestWithZeroField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });

      it(`returns a 2xx response if ${fieldName} is greater than 0`, async () => {
        const requestWithZeroField = { ...requestBodyItem, [fieldNameSymbol]: 100 };
        const preparedRequestWithZeroField = prepareModifiedRequest(requestIsAnArray, requestWithZeroField);

        const { status } = await makeRequest(preparedRequestWithZeroField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }
  });
}

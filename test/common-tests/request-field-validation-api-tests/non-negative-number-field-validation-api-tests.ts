import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

interface RequiredNonNegativeFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  required?: boolean;
  enum?: any;
  generateFieldValueThatDoesNotMatchEnum?: () => number;
  validRequestBody: RequestBodyItem[];
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
  required = required ?? true;

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    if (required) {
      it(`returns a 400 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutField } = validRequestBody[0];

        const { status, body } = await makeRequest([requestWithoutField]);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must not be less than 0`, `${fieldName} should not be empty`]),
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 201 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutField } = validRequestBody[0];

        const { status } = await makeRequest([requestWithoutField]);

        expect(status).toBe(201);
      });
    }

    it(`returns a 400 response if ${fieldName} is less than 0`, async () => {
      const requestWithNegativeField = [{ ...validRequestBody[0], [fieldNameSymbol]: -0.01 }];

      const { status, body } = await makeRequest(requestWithNegativeField);

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

      it(`returns a 201 response if ${fieldName} does match the enum`, async () => {
        const requestWithInvalidField = [
          { ...validRequestBody[0], [fieldNameSymbol]: possibleValues[valueGenerator.integer({ min: 0, max: possibleValues.length - 1 })] },
        ];

        const { status } = await makeRequest(requestWithInvalidField);

        expect(status).toBe(201);
      });

      it(`returns a 400 response if ${fieldName} does not match the enum`, async () => {
        const requestWithInvalidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueThatDoesNotMatchEnum() }];

        const { status, body } = await makeRequest(requestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be one of the following values: ${possibleValues.join(', ')}`]),
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 201 response if ${fieldName} is 0`, async () => {
        const requestWithZeroField = [{ ...validRequestBody[0], [fieldNameSymbol]: 0 }];

        const { status } = await makeRequest(requestWithZeroField);

        expect(status).toBe(201);
      });

      it(`returns a 201 response if ${fieldName} is greater than 0`, async () => {
        const requestWithZeroField = [{ ...validRequestBody[0], [fieldNameSymbol]: 100 }];

        const { status } = await makeRequest(requestWithZeroField);

        expect(status).toBe(201);
      });
    }
  });
}

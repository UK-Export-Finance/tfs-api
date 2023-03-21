import request from 'supertest';

interface RequiredNonNegativeFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withRequiredNonNegativeNumberFieldValidationApiTests<RequestBodyItem>({
  fieldName: fieldNameSymbol,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: RequiredNonNegativeFieldValidationApiTestOptions<RequestBodyItem>): void {
  const fieldName = fieldNameSymbol.toString();

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    it(`returns a 400 response if ${fieldName} is not present`, async () => {
      const { [fieldNameSymbol]: _removed, ...requestWithoutField } = validRequestBody[0];

      const { status, body } = await makeRequest([requestWithoutField]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must not be less than 0`, `${fieldName} should not be empty`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is less than 0`, async () => {
      const requestWithNegativeField = [{ ...validRequestBody[0], [fieldNameSymbol]: -0.01 }];

      const { status, body } = await makeRequest(requestWithNegativeField);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must not be less than 0`],
        statusCode: 400,
      });
    });

    it(`returns a 201 response if ${fieldName} is 0`, async () => {
      const requestWithZeroField = [{ ...validRequestBody[0], [fieldNameSymbol]: 0 }];

      const { status } = await makeRequest(requestWithZeroField);

      expect(status).toBe(201);
    });
  });
}

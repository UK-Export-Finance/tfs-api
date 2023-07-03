import request from 'supertest';

interface Options<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  validRequestBody: RequestBodyItem[];
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withRequiredBooleanFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
  fieldName: fieldNameSymbol,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: Options<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    it(`returns a 400 response if ${fieldName} is not present`, async () => {
      const [{ [fieldNameSymbol]: _removed, ...requestWithoutTheField }] = validRequestBody;

      const { status, body } = await makeRequest([requestWithoutTheField]);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} should not be empty`]),
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is null`, async () => {
      const requestWithNullField = { ...validRequestBody[0], [fieldNameSymbol]: null };

      const { status, body } = await makeRequest([requestWithNullField]);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be a boolean value`]),
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is string`, async () => {
      const requestWithStringField = { ...validRequestBody[0], [fieldNameSymbol]: 'true' };

      const { status, body } = await makeRequest([requestWithStringField]);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be a boolean value`]),
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is number`, async () => {
      const requestWithNumberField = { ...validRequestBody[0], [fieldNameSymbol]: 1 };

      const { status, body } = await makeRequest([requestWithNumberField]);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be a boolean value`]),
        statusCode: 400,
      });
    });
  });
}

import request from 'supertest';

interface StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  length: number;
  required: boolean;
  generateFieldValueOfLength: (length: number) => RequestBodyItem[RequestBodyItemKey];
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withStringFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
  fieldName: fieldNameSymbol,
  length,
  required,
  generateFieldValueOfLength,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    if (required) {
      it(`returns a 400 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithField } = validRequestBody[0];

        const { status, body } = await makeRequest([requestWithField]);

        expect(status).toBe(400);
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be longer than or equal to ${length} characters`],
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 201 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithField } = validRequestBody[0];

        const { status } = await makeRequest([requestWithField]);

        expect(status).toBe(201);
      });
    }

    it(`returns a 400 response if ${fieldName} is an empty string`, async () => {
      const requestWithEmptyField = [{ ...validRequestBody[0], [fieldNameSymbol]: '' }];

      const { status, body } = await makeRequest(requestWithEmptyField);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be longer than or equal to ${length} characters`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} has fewer than ${length} characters`, async () => {
      const requestWithTooShortField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(length - 1) }];

      const { status, body } = await makeRequest(requestWithTooShortField);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be longer than or equal to ${length} characters`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} has more than ${length} characters`, async () => {
      const requestWithTooLongField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(length + 1) }];

      const { status, body } = await makeRequest(requestWithTooLongField);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be shorter than or equal to ${length} characters`],
        statusCode: 400,
      });
    });

    it(`returns a 201 response if ${fieldName} has ${length} characters`, async () => {
      const requestWithValidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(length) }];

      const { status } = await makeRequest(requestWithValidField);

      expect(status).toBe(201);
    });
  });
}

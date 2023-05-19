import request from 'supertest';

export interface BooleanFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  required?: boolean;
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withBooleanFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
  fieldName: fieldNameSymbol,
  required,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: BooleanFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();
  required = required ?? true;

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    if (required) {
      it(`returns a 400 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutTheField } = validRequestBody[0];

        const { status, body } = await makeRequest([requestWithoutTheField]);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} should not be empty`]),
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
  });
}

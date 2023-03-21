import request from 'supertest';

interface RequiredDateOnlyFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withRequiredDateOnlyFieldValidationApiTests<RequestBodyItem>({
  fieldName: fieldNameSymbol,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: RequiredDateOnlyFieldValidationApiTestOptions<RequestBodyItem>): void {
  const fieldName = fieldNameSymbol.toString();

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    it(`returns a 400 response if ${fieldName} is not present`, async () => {
      const { [fieldNameSymbol]: _removed, ...requestWithoutTheField } = validRequestBody[0];

      const { status, body } = await makeRequest([requestWithoutTheField]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be a valid ISO 8601 date string`, `${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} has time part of date string`, async () => {
      const requestWithDateInIncorrectFormat = [{ ...validRequestBody[0], [fieldName]: '2023-02-01T00:00:00Z' }];

      const { status, body } = await makeRequest(requestWithDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not in YYYY-MM-DD date format`, async () => {
      const requestWithDateInIncorrectFormat = [{ ...validRequestBody[0], [fieldName]: '20230201' }];

      const { status, body } = await makeRequest(requestWithDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not a valid date`, async () => {
      const requestWithInvalidDate = [{ ...validRequestBody[0], [fieldName]: '2023-99-10' }];

      const { status, body } = await makeRequest(requestWithInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be a valid ISO 8601 date string`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not a real day`, async () => {
      const requestWithInvalidDate = [{ ...validRequestBody[0], [fieldName]: '2019-02-29' }];

      const { status, body } = await makeRequest(requestWithInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be a valid ISO 8601 date string`],
        statusCode: 400,
      });
    });

    it(`returns a 201 response if ${fieldName} is a valid date`, async () => {
      const requestWithValidDate = [{ ...validRequestBody[0], [fieldName]: '2022-02-01' }];

      const { status } = await makeRequest(requestWithValidDate);

      expect(status).toBe(201);
    });
  });
}

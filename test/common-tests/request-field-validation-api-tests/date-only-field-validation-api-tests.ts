import request from 'supertest';

interface DateOnlyFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  required?: boolean;
  nullable?: boolean;
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withDateOnlyFieldValidationApiTests<RequestBodyItem>({
  fieldName: fieldNameSymbol,
  required,
  nullable,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: DateOnlyFieldValidationApiTestOptions<RequestBodyItem>): void {
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
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be a valid ISO 8601 date string`, `${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
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

    if (nullable) {
      it(`returns a 201 response if ${fieldName} is null`, async () => {
        const requestWithNullDate = [{ ...validRequestBody[0], [fieldName]: null }];

        const { status } = await makeRequest(requestWithNullDate);

        expect(status).toBe(201);
      });
    } else {
      it(`returns a 400 response if ${fieldName} is null`, async () => {
        const requestWithNullDate = [{ ...validRequestBody[0], [fieldName]: null }];

        const { status, body } = await makeRequest(requestWithNullDate);

        expect(status).toBe(400);
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be a valid ISO 8601 date string`, `${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
          statusCode: 400,
        });
      });
    }

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

import { prepareModifiedRequest } from '@ukef-test/support/helpers/request-field-validation-helper';
import request from 'supertest';

interface DateOnlyFieldValidationApiTestOptions<RequestBodyItem> {
  fieldName: keyof RequestBodyItem;
  required?: boolean;
  nullable?: boolean;
  validRequestBody: RequestBodyItem[] | RequestBodyItem;
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
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

  const requestIsAnArray = Array.isArray(validRequestBody);
  const requestBodyItem = requestIsAnArray ? validRequestBody[0] : validRequestBody;

  required = required ?? true;

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    if (required) {
      it(`returns a 400 response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithoutTheField } = requestBodyItem;
        const preparedRequestWithoutTheField = prepareModifiedRequest(requestIsAnArray, requestWithoutTheField);

        const { status, body } = await makeRequest(preparedRequestWithoutTheField);

        expect(status).toBe(400);
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be a valid ISO 8601 date string`, `${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
          statusCode: 400,
        });
      });
    } else {
      it(`returns a 2xx response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithField } = requestBodyItem;
        const preparedRequestWithField = prepareModifiedRequest(requestIsAnArray, requestWithField);

        const { status } = await makeRequest(preparedRequestWithField);
        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }

    if (nullable) {
      it(`returns a 2xx response if ${fieldName} is null`, async () => {
        const requestWithNullDate = { ...requestBodyItem, [fieldName]: null };
        const preparedRequestWithNullDate = prepareModifiedRequest(requestIsAnArray, requestWithNullDate);

        const { status } = await makeRequest(preparedRequestWithNullDate);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    } else {
      it(`returns a 400 response if ${fieldName} is null`, async () => {
        const requestWithNullDate = { ...requestBodyItem, [fieldName]: null };
        const preparedRequestWithNullDate = prepareModifiedRequest(requestIsAnArray, requestWithNullDate);

        const { status, body } = await makeRequest(preparedRequestWithNullDate);

        expect(status).toBe(400);
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be a valid ISO 8601 date string`, `${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
          statusCode: 400,
        });
      });
    }

    it(`returns a 400 response if ${fieldName} has time part of date string`, async () => {
      const requestWithDateInIncorrectFormat = { ...requestBodyItem, [fieldName]: '2023-02-01T00:00:00Z' };
      const preparedRequestWithDateInIncorrectFormat = prepareModifiedRequest(requestIsAnArray, requestWithDateInIncorrectFormat);

      const { status, body } = await makeRequest(preparedRequestWithDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not in YYYY-MM-DD date format`, async () => {
      const requestWithDateInIncorrectFormat = { ...requestBodyItem, [fieldName]: '20230201' };
      const preparedRequestWithDateInIncorrectFormat = prepareModifiedRequest(requestIsAnArray, requestWithDateInIncorrectFormat);
      const { status, body } = await makeRequest(preparedRequestWithDateInIncorrectFormat);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must match /^\\d{4}-\\d{2}-\\d{2}$/ regular expression`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not a valid date`, async () => {
      const requestWithInvalidDate = { ...requestBodyItem, [fieldName]: '2023-99-10' };
      const preparedRequestWithInvalidDate = prepareModifiedRequest(requestIsAnArray, requestWithInvalidDate);
      const { status, body } = await makeRequest(preparedRequestWithInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be a valid ISO 8601 date string`],
        statusCode: 400,
      });
    });

    it(`returns a 400 response if ${fieldName} is not a real day`, async () => {
      const requestWithInvalidDate = { ...requestBodyItem, [fieldName]: '2019-02-29' };
      const preparedRequestWithInvalidDate = prepareModifiedRequest(requestIsAnArray, requestWithInvalidDate);

      const { status, body } = await makeRequest(preparedRequestWithInvalidDate);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be a valid ISO 8601 date string`],
        statusCode: 400,
      });
    });

    it(`returns a 2xx response if ${fieldName} is a valid date`, async () => {
      const requestWithValidDate = { ...requestBodyItem, [fieldName]: '2022-02-01' };
      const preparedRequestWithValidDate = prepareModifiedRequest(requestIsAnArray, requestWithValidDate);

      const { status } = await makeRequest(preparedRequestWithValidDate);

      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(300);
    });
  });
}

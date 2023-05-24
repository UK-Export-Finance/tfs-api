import { prepareModifiedRequest } from '@ukef-test/support/helpers/request-field-validation-helper';
import request from 'supertest';

export interface EnumFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  enum?: any;
  generateFieldValueOfLength: (length: number) => string;
  generateFieldValueThatDoesNotMatchRegex?: () => string;
  generateFieldValueThatDoesNotMatchEnum?: () => string;
  validRequestBody: RequestBodyItem[] | RequestBodyItem;
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withEnumFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
  fieldName: fieldNameSymbol,
  length: lengthOption,
  minLength: minLengthOption,
  maxLength: maxLengthOption,
  required,
  pattern,
  enum: theEnum,
  generateFieldValueThatDoesNotMatchEnum,
  generateFieldValueOfLength,
  generateFieldValueThatDoesNotMatchRegex,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: EnumFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ fieldName, minLengthOption, maxLengthOption, lengthOption });

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
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
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

    if (minLength > 0) {
      it(`returns a 400 response if ${fieldName} is an empty string`, async () => {
        const requestWithEmptyField = { ...requestBodyItem, [fieldNameSymbol]: '' };
        const preparedRequestWithEmptyField = prepareModifiedRequest(requestIsAnArray, requestWithEmptyField);

        const { status, body } = await makeRequest(preparedRequestWithEmptyField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
          statusCode: 400,
        });
      });

      if (minLength > 1) {
        it(`returns a 400 response if ${fieldName} has fewer than ${minLength} characters`, async () => {
          const requestWithTooShortField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(minLength - 1) };
          const preparedRequestWithTooShortField = prepareModifiedRequest(requestIsAnArray, requestWithTooShortField);

          const { status, body } = await makeRequest(preparedRequestWithTooShortField);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    } else {
      it(`returns a 2xx response if ${fieldName} is an empty string`, async () => {
        const requestWithEmptyField = { ...requestBodyItem, [fieldNameSymbol]: '' };
        const preparedRequestWithEmptyField = prepareModifiedRequest(requestIsAnArray, requestWithEmptyField);
        const { status } = await makeRequest(preparedRequestWithEmptyField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }

    it(`returns a 2xx response if ${fieldName} has ${minLength} characters`, async () => {
      const requestWithValidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(minLength) };
      const preparedRequestWithValidField = prepareModifiedRequest(requestIsAnArray, requestWithValidField);

      const { status } = await makeRequest(preparedRequestWithValidField);

      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(300);
    });

    if (minLength !== maxLength) {
      it(`returns a 2xx response if ${fieldName} has ${maxLength} characters`, async () => {
        const requestWithValidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(maxLength) };
        const preparedRequestWithValidField = prepareModifiedRequest(requestIsAnArray, requestWithValidField);

        const { status } = await makeRequest(preparedRequestWithValidField);

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }

    it(`returns a 400 response if ${fieldName} has more than ${maxLength} characters`, async () => {
      const requestWithTooLongField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(maxLength + 1) };
      const preparedRequestWithTooLongField = prepareModifiedRequest(requestIsAnArray, requestWithTooLongField);

      const { status, body } = await makeRequest(preparedRequestWithTooLongField);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
        statusCode: 400,
      });
    });

    if (pattern && generateFieldValueThatDoesNotMatchRegex) {
      it(`returns a 400 response if ${fieldName} does not match the regular expression ${pattern}`, async () => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueThatDoesNotMatchRegex() };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must match ${pattern} regular expression`]),
          statusCode: 400,
        });
      });
    }

    if (theEnum && generateFieldValueThatDoesNotMatchEnum) {
      it(`returns a 400 response if ${fieldName} does not match the enum`, async () => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueThatDoesNotMatchEnum() };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
          statusCode: 400,
        });
      });
    }
  });
}

const getMinAndMaxLengthFromOptions = ({
  fieldName,
  minLengthOption,
  maxLengthOption,
  lengthOption,
}: {
  fieldName: string;
  minLengthOption?: number;
  maxLengthOption?: number;
  lengthOption?: number;
}): { minLength: number; maxLength: number } => {
  const isLengthDefined = lengthOption || lengthOption === 0;
  const isMinLengthDefined = minLengthOption || minLengthOption === 0;
  const isMaxLengthDefined = maxLengthOption || maxLengthOption === 0;

  if (isLengthDefined) {
    if (isMinLengthDefined) {
      throw new Error(`You cannot specify both minLength and length for ${fieldName}.`);
    }

    if (isMaxLengthDefined) {
      throw new Error(`You cannot specify both maxLength and length for ${fieldName}.`);
    }

    return {
      minLength: lengthOption,
      maxLength: lengthOption,
    };
  }

  if (!isMinLengthDefined || !isMaxLengthDefined) {
    throw new Error(`You must specify either length or minLength and maxLength for ${fieldName}.`);
  }

  return {
    minLength: minLengthOption,
    maxLength: maxLengthOption,
  };
};

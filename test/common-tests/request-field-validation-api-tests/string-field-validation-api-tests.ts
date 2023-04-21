import request from 'supertest';

export interface StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: string;
  enum?: any;
  generateFieldValueOfLength: (length: number) => RequestBodyItem[RequestBodyItemKey];
  generateFieldValueThatDoesNotMatchRegex?: () => RequestBodyItem[RequestBodyItemKey];
  generateFieldValueThatDoesNotMatchEnum?: () => RequestBodyItem[RequestBodyItemKey];
  validRequestBody: RequestBodyItem[];
  makeRequest: (body: unknown[]) => request.Test;
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withStringFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
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
}: StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ fieldName, minLengthOption, maxLengthOption, lengthOption });
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
          message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
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

    if (minLength > 0) {
      it(`returns a 400 response if ${fieldName} is an empty string`, async () => {
        const requestWithEmptyField = [{ ...validRequestBody[0], [fieldNameSymbol]: '' }];

        const { status, body } = await makeRequest(requestWithEmptyField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
          statusCode: 400,
        });
      });

      if (minLength > 1) {
        it(`returns a 400 response if ${fieldName} has fewer than ${minLength} characters`, async () => {
          const requestWithTooShortField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(minLength - 1) }];

          const { status, body } = await makeRequest(requestWithTooShortField);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    } else {
      it(`returns a 201 response if ${fieldName} is an empty string`, async () => {
        const requestWithEmptyField = [{ ...validRequestBody[0], [fieldNameSymbol]: '' }];

        const { status } = await makeRequest(requestWithEmptyField);

        expect(status).toBe(201);
      });
    }

    it(`returns a 201 response if ${fieldName} has ${minLength} characters`, async () => {
      const requestWithValidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(minLength) }];

      const { status } = await makeRequest(requestWithValidField);

      expect(status).toBe(201);
    });

    if (minLength !== maxLength) {
      it(`returns a 201 response if ${fieldName} has ${maxLength} characters`, async () => {
        const requestWithValidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(maxLength) }];

        const { status } = await makeRequest(requestWithValidField);

        expect(status).toBe(201);
      });
    }

    it(`returns a 400 response if ${fieldName} has more than ${maxLength} characters`, async () => {
      const requestWithTooLongField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(maxLength + 1) }];

      const { status, body } = await makeRequest(requestWithTooLongField);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be shorter than or equal to ${maxLength} characters`]),
        statusCode: 400,
      });
    });

    if (pattern && generateFieldValueThatDoesNotMatchRegex) {
      it(`returns a 400 response if ${fieldName} does not match the regular expression ${pattern}`, async () => {
        const requestWithInvalidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueThatDoesNotMatchRegex() }];

        const { status, body } = await makeRequest(requestWithInvalidField);

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
        const requestWithInvalidField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueThatDoesNotMatchEnum() }];

        const { status, body } = await makeRequest(requestWithInvalidField);

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

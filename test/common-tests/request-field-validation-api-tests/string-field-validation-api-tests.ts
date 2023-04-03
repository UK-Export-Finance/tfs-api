import request from 'supertest';

interface StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required: boolean;
  generateFieldValueOfLength: (length: number) => RequestBodyItem[RequestBodyItemKey];
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
  generateFieldValueOfLength,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ fieldName, minLengthOption, maxLengthOption, lengthOption });

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
          message: [`${fieldName} must be longer than or equal to ${minLength} characters`],
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
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be longer than or equal to ${minLength} characters`],
          statusCode: 400,
        });
      });

      it(`returns a 400 response if ${fieldName} has fewer than ${minLength} characters`, async () => {
        const requestWithTooShortField = [{ ...validRequestBody[0], [fieldNameSymbol]: generateFieldValueOfLength(minLength - 1) }];

        const { status, body } = await makeRequest(requestWithTooShortField);

        expect(status).toBe(400);
        expect(body).toStrictEqual({
          error: 'Bad Request',
          message: [`${fieldName} must be longer than or equal to ${minLength} characters`],
          statusCode: 400,
        });
      });
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
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [`${fieldName} must be shorter than or equal to ${maxLength} characters`],
        statusCode: 400,
      });
    });
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

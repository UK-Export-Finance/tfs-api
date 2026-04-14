import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type CurrencyFieldName = 'currency';

interface CurrencyFieldValidationApiTestOptions<RequestBodyItem extends { currency: string }> extends Pick<
  StringFieldValidationApiTestOptions<RequestBodyItem, CurrencyFieldName>,
  'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
> {
  valueGenerator: RandomValueGenerator;
}

export const withCurrencyFieldValidationApiTests = <RequestBodyItem extends { currency: string }>({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: CurrencyFieldValidationApiTestOptions<RequestBodyItem>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, CurrencyFieldName>({
    fieldName: 'currency',
    length: 3,
    generateFieldValueOfLength: (length: number) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

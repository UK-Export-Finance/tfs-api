import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type CovenantIdentifierFieldName = 'covenantIdentifier';

interface CovenantIdentifierFieldValidationApiTestOptions<RequestBodyItem extends { covenantIdentifier: string }>
  extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, CovenantIdentifierFieldName>,
    'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withCovenantIdentifierFieldValidationApiTests = <RequestBodyItem extends { covenantIdentifier: string }>({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: CovenantIdentifierFieldValidationApiTestOptions<RequestBodyItem>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, CovenantIdentifierFieldName>({
    fieldName: 'covenantIdentifier',
    minLength: 0,
    maxLength: 10,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

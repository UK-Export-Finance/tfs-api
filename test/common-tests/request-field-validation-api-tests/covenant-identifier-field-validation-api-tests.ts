import { UKEFID } from '@ukef/constants';
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
    length: 10,
    pattern: UKEFID.COVENANT_ID.REGEX,
    generateFieldValueOfLength: (length: number) => valueGenerator.ukefCovenantId(length - 4),
    generateFieldValueThatDoesNotMatchRegex: () => '1000000000',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

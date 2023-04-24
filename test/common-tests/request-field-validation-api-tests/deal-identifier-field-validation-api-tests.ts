import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type DealIdentifierFieldName = 'dealIdentifier';

interface DealIdentifierFieldValidationApiTestOptions<RequestBodyItem extends { dealIdentifier: string }>
  extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, DealIdentifierFieldName>,
    'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withDealIdentifierFieldValidationApiTests = <RequestBodyItem extends { dealIdentifier: string }>({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: DealIdentifierFieldValidationApiTestOptions<RequestBodyItem>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, DealIdentifierFieldName>({
    fieldName: 'dealIdentifier',
    length: 10,
    pattern: '/^00\\d{8}$/',
    generateFieldValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
    generateFieldValueThatDoesNotMatchRegex: () => '1000000000',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

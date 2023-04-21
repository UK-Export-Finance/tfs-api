import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type FacilityIdentifierFieldName = 'facilityIdentifier';

interface FacilityIdentifierFieldValidationApiTestOptions<RequestBodyItem extends { facilityIdentifier: string }>
  extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, FacilityIdentifierFieldName>,
    'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withFacilityIdentifierFieldValidationApiTests = <RequestBodyItem extends { facilityIdentifier: string }>({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: FacilityIdentifierFieldValidationApiTestOptions<RequestBodyItem>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, FacilityIdentifierFieldName>({
    fieldName: 'facilityIdentifier',
    length: 10,
    pattern: '/^00\\d{8}$/',
    generateFieldValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
    generateFieldValueThatDoesNotMatchRegex: () => '1000000000',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

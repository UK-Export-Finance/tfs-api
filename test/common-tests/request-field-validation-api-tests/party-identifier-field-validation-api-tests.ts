import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

interface PartyIdentifierFieldValidationApiTestOptions<
  RequestBodyItem extends Record<PartyIdentifierFieldName, string>,
  PartyIdentifierFieldName extends keyof any,
> extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, PartyIdentifierFieldName>,
    'fieldName' | 'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withPartyIdentifierFieldValidationApiTests = <
  RequestBodyItem extends Record<PartyIdentifierFieldName, string>,
  PartyIdentifierFieldName extends keyof any,
>({
  fieldName,
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: PartyIdentifierFieldValidationApiTestOptions<RequestBodyItem, PartyIdentifierFieldName>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, PartyIdentifierFieldName>({
    fieldName,
    length: 8,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }) as RequestBodyItem[PartyIdentifierFieldName],
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

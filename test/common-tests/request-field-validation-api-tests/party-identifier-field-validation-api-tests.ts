import { UKEFID } from '@ukef/constants';
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
    pattern: UKEFID.PARTY_ID.REGEX,
    generateFieldValueOfLength: (length: number) => valueGenerator.stringOfNumericCharacters({ length }) as RequestBodyItem[PartyIdentifierFieldName],
    generateFieldValueThatDoesNotMatchRegex: () => ' '.repeat(8) as RequestBodyItem[PartyIdentifierFieldName],
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

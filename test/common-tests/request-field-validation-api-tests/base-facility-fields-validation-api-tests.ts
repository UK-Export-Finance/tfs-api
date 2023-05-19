import { BaseFacilityRequestItem } from '@ukef/modules/facility/dto/base-facility-request.dto';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

import { withCurrencyFieldValidationApiTests } from './currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from './date-only-field-validation-api-tests';
import { withDealIdentifierFieldValidationApiTests } from './deal-identifier-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from './non-negative-number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from './party-identifier-field-validation-api-tests';
import { withStringFieldValidationApiTests } from './string-field-validation-api-tests';

export interface withBaseFacilityFieldsValidationApiTestInterface {
  valueGenerator: RandomValueGenerator;
  validRequestBody: BaseFacilityRequestItem[] | BaseFacilityRequestItem;
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withBaseFacilityFieldsValidationApiTests({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: withBaseFacilityFieldsValidationApiTestInterface) {
  withDealIdentifierFieldValidationApiTests({
    valueGenerator,
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withPartyIdentifierFieldValidationApiTests({
    fieldName: 'dealBorrowerIdentifier',
    valueGenerator,
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'productTypeId',
    minLength: 0,
    maxLength: 3,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'productTypeName',
    minLength: 0,
    maxLength: 13,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'exposurePeriod',
    minLength: 0,
    maxLength: 12,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withCurrencyFieldValidationApiTests({
    valueGenerator,
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'obligorIndustryClassification',
    minLength: 0,
    maxLength: 10,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'effectiveDate',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'guaranteeExpiryDate',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withDateOnlyFieldValidationApiTests({
    fieldName: 'nextQuarterEndDate',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'maximumLiability',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'agentBankIdentifier',
    minLength: 0,
    maxLength: 10,
    generateFieldValueOfLength: (length) => valueGenerator.stringOfNumericCharacters({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'riskCountryCode',
    minLength: 0,
    maxLength: 3,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'premiumFrequencyCode',
    minLength: 0,
    maxLength: 1,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'riskStatusCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'creditRatingCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'facilityStageCode',
    minLength: 0,
    maxLength: 2,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'delegationType',
    minLength: 0,
    maxLength: 4,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'interestOrFeeRate',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withPartyIdentifierFieldValidationApiTests({
    fieldName: 'obligorPartyIdentifier',
    valueGenerator,
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'forecastPercentage',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withNonNegativeNumberFieldValidationApiTests({
    fieldName: 'probabilityOfDefault',
    required: false,
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  withStringFieldValidationApiTests({
    fieldName: 'capitalConversionFactorCode',
    minLength: 0,
    maxLength: 2,
    required: false,
    generateFieldValueOfLength: (length) => valueGenerator.string({ length }),
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });
}

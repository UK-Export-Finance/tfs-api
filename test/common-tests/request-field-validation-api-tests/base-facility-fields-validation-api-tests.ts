import { ENUMS } from '@ukef/constants';
import { BaseFacilityRequestItem } from '@ukef/modules/facility/dto/base-facility-request.dto';
import { withCurrencyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/currency-field-validation-api-tests';
import { withDateOnlyFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/date-only-field-validation-api-tests';
import { withDealIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/deal-identifier-field-validation-api-tests';
import { withNonNegativeNumberFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/non-negative-number-field-validation-api-tests';
import { withPartyIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/party-identifier-field-validation-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import request from 'supertest';

export interface withBaseFacilityFieldsValidationApiTestInterface {
  valueGenerator: RandomValueGenerator;
  validRequestBody: BaseFacilityRequestItem[] | BaseFacilityRequestItem;
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
  givenAnyRequestBodyWouldSucceed: () => void;
  includeIssueDate?: boolean;
}

export function withBaseFacilityFieldsValidationApiTests({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
  includeIssueDate = true,
}: withBaseFacilityFieldsValidationApiTestInterface) {
  if (includeIssueDate) {
    const notIssuedFacilityStageCodes = Object.values(ENUMS.FACILITY_STAGES)
      .filter((code) => code !== ENUMS.FACILITY_STAGES.ISSUED)
      .map((code) => ({ notIssuedCode: code }));
    describe.each(notIssuedFacilityStageCodes)('when facilityStageCode is $notIssuedCode', ({ notIssuedCode }) => {
      const validRequestBodyWithFacilityStageCode: BaseFacilityRequestItem[] | BaseFacilityRequestItem = Array.isArray(validRequestBody)
        ? [{ ...validRequestBody[0], facilityStageCode: notIssuedCode }]
        : { ...validRequestBody, facilityStageCode: notIssuedCode };

      withDateOnlyFieldValidationApiTests<BaseFacilityRequestItem>({
        fieldName: 'issueDate',
        required: false,
        nullable: true,
        validRequestBody: validRequestBodyWithFacilityStageCode,
        makeRequest,
        givenAnyRequestBodyWouldSucceed,
      });
    });

    describe(`when facilityStageCode is ${ENUMS.FACILITY_STAGES.ISSUED}`, () => {
      withDateOnlyFieldValidationApiTests({
        fieldName: 'issueDate',
        required: true,
        nullable: false,
        validRequestBody,
        makeRequest,
        givenAnyRequestBodyWouldSucceed,
      });
    });
  }

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
    enum: ENUMS.FACILITY_TYPE_IDS,
    generateFieldValueThatDoesNotMatchEnum: () => '123',
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
    enum: ENUMS.FACILITY_STAGES,
    generateFieldValueThatDoesNotMatchEnum: () => '12',
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

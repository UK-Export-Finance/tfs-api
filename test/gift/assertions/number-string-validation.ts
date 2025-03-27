import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_NUMBER_STRING_VALUES } from './values';

/**
 * Validation tests for a number string field with invalid values
 * @param {String} fieldName: The name of a field. E.g, uniqueReferenceNumber
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const numberStringValidation = ({ fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: 'must be a number string',
    fieldName,
    initialPayload,
    invalidValues: INVALID_NUMBER_STRING_VALUES,
    parentFieldName,
    url,
  });

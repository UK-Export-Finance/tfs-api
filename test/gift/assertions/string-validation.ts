import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_STRING_VALUES } from './values';

/**
 * Validation tests for a string field with invalid values
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const stringValidation = ({ fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: 'must be a string',
    fieldName,
    initialPayload,
    invalidValues: INVALID_STRING_VALUES,
    parentFieldName,
    url,
  });

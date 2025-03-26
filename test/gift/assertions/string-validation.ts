import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_STRING_VALUES } from './values';

/**
 * Validation tests for a string field with invalid values
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} fieldPath: The path of a field. E.g, parentObject.email
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const stringValidation = ({ fieldPath, fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: 'must be a string',
    fieldName,
    fieldPath,
    initialPayload,
    invalidValues: INVALID_STRING_VALUES,
    parentFieldName,
    url,
  });

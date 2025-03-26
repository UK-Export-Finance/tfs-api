import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_BOOLEAN_VALUES } from './values';

/**
 * Validation tests for a boolean field with invalid values
 * @param {String} fieldName: The name of a field. E.g, isRevolving
 * @param {String} fieldPath: The path of a field. E.g, parentObject.email
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const booleanValidation = ({ fieldPath, fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: 'must be a boolean value',
    fieldName,
    fieldPath,
    initialPayload,
    invalidValues: INVALID_BOOLEAN_VALUES,
    parentFieldName,
    url,
  });

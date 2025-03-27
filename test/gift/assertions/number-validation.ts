import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_NUMBER_VALUES } from './values';

/**
 * Validation tests for a number field with invalid values
 * @param {String} fieldName: The name of a field. E.g, amount
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const numberValidation = ({ fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: 'must not be less than 0',
    fieldName,
    initialPayload,
    invalidValues: INVALID_NUMBER_VALUES,
    parentFieldName,
    url,
  });

import { UKEFID } from '@ukef/constants';

import { executeFieldValidationAssertion } from './execute-field-validation-assertion';
import { INVALID_UKEF_IDS } from './values';

/**
 * Validation tests for a UKEF ID field with invalid values
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} fieldPath: The path of a field. E.g, parentObject.email
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} url: The URL the tests will call.
 */
export const ukefIdValidation = ({ fieldPath, fieldName, initialPayload, parentFieldName, url }) =>
  executeFieldValidationAssertion({
    expectedMessage: `must match ${UKEFID.MAIN_ID.TEN_DIGIT_REGEX} regular expression`,
    fieldName,
    fieldPath,
    initialPayload,
    invalidValues: INVALID_UKEF_IDS,
    parentFieldName,
    url,
  });

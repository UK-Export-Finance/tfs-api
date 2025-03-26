/**
 * Generate a payload for a field validation assertion.
 * This function generates the following:
 * - A payload object with a direct child field.
 * - A payload object with a nested child field.
 * with a value being assigned to the provided field name:
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {String} value: The value to assign to fieldName.
 * @returns {Object} payload for testing purposes
 */
export const generatePayload = ({ initialPayload, fieldName, parentFieldName = '', value }) => {
  if (parentFieldName) {
    return {
      ...initialPayload,
      [`${parentFieldName}`]: {
        ...initialPayload[`${parentFieldName}`],
        [fieldName]: value,
      },
    };
  }

  return {
    ...initialPayload,
    [fieldName]: value,
  };
};

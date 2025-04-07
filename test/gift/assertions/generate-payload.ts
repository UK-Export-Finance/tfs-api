/**
 * Generate a payload for a field validation assertion.
 * This function generates the following:
 * - A payload object with a direct child field.
 * - A payload object with a nested child field.
 * with a value being assigned to the provided field name:
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {any} value: The value to assign to fieldName.
 * @returns {Object} payload for testing purposes
 */
export const generatePayload = ({ initialPayload, fieldName, parentFieldName = '', value = null }) => {
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

/**
 * Generate a payload for an array of objects, for field validation assertion in each object.
 * This function generates a payload object with an array of objects,
 * with a value being assigned to the provided field name, for each object in the array.
 * @param {Object} initialPayload: The payload to use before adding a field value
 * @param {String} fieldName: The name of a field. E.g, email
 * @param {String} parentFieldName: The name of a parent field. E.g parentObject
 * @param {any} value: The value to assign to fieldName.
 * @returns {Object} payload for testing purposes
 */
export const generatePayloadArrayOfObjects = ({ initialPayload, fieldName, parentFieldName = '', value }) => ({
  ...initialPayload,
  [`${parentFieldName}`]: initialPayload[`${parentFieldName}`].map((item: object) => ({
    ...item,
    [`${fieldName}`]: value,
  })),
});

/**
 * Check if an array of objects contains a property with a specific value
 * @param {Object[]} array: Array of objects
 * @param {String} fieldName: Field name to check
 * @param {String} fieldValue: Field value
 * @returns {Boolean}
 */
export const arrayOfObjectsHasValue = (array: object[], fieldName: string, fieldValue: string) => {
  if (array.length) {
    return array.find((object) => (object[`${fieldName}`] === fieldValue ? true : false));
  }

  return false;
};

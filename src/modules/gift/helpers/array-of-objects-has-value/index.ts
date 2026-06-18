/**
 * Check if an array of objects contains a property with a specific value
 * @param {Object[]} array: Array of objects
 * @param {string} fieldName: Field name to check
 * @param {string} fieldValue: Field value
 * @returns {boolean}
 */
export const arrayOfObjectsHasValue = (array: object[], fieldName: string, fieldValue: string) => {
  if (array.length) {
    if (array.find((object) => object[`${fieldName}`] === fieldValue)) {
      return true;
    }
  }

  return false;
};

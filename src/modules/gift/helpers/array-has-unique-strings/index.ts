/**
 * Check if an array has unique string values
 * @param {String[]} array: Array of strings
 * @returns {boolean}
 */
export const arrayHasUniqueStrings = (array: string[]) => {
  if (array.length) {
    const uniqueValues = [...new Set(array)];

    return uniqueValues.length === array.length;
  }

  return false;
};

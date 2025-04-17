/**
 * Check if an array has unique string values
 * @param {string[]} arr: Array of strings
 * @returns {Boolean}
 */
export const arrayHasUniqueStrings = (arr: string[]) => {
  if (arr.length) {
    const uniqueValues = [...new Set(arr)];

    return uniqueValues.length === arr.length;
  }

  return false;
};

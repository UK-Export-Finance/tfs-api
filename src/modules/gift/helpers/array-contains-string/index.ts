/**
 * Check if an array contains a string value
 * @param {String[]} arr: Array of strings
 * @param {String} str: String to check
 * @returns {Boolean}
 */
export const arrayContainsString = (arr: string[], str: string) => {
  if (arr.length) {
    return arr.includes(str);
  }

  return false;
};

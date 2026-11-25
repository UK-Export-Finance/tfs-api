/**
 * Check if an array contains a string value
 * @param {String[]} array: Array of strings
 * @param {string} search: String to search for
 * @returns {boolean}
 */
export const arrayContainsString = (array: string[], search: string) => (array.length ? array.includes(search) : false);

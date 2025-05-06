/**
 * Check if an array contains a string value
 * @param {String[]} array: Array of strings
 * @param {String} search: String to search for
 * @returns {Boolean}
 */
export const arrayContainsString = (array: string[], search: string) => (array.length ? array.includes(search) : false);

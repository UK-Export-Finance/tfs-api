/**
 * Converts a regular expression to its string representation suitable for Swagger documentation.
 * @param {RegExp} regex - The regular expression to convert.
 * @returns {string} The string representation of the regular expression suitable for Swagger documentation.
 */
export const regexToString = (regex: RegExp): string => regex.source;

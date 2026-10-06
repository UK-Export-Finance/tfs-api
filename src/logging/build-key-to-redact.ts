const prefix = `["`;
const suffix = `"]`;
const joinSeparator = `${suffix}${prefix}`;

/**
 * Builds a key to redact by joining the provided parts with a specific format.
 * Each part is wrapped in `["` and `"]` and joined with `"]["`.
 *
 * @param {string[]} parts - The parts of the key to redact.
 * @returns {string} The formatted key to redact.
 */
export const buildKeyToRedact = (parts: string[]): string => {
  if (!parts.length) {
    return '';
  }

  return `${prefix}${parts.join(joinSeparator)}${suffix}`;
};

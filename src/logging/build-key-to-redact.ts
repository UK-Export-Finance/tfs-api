const prefix = `["`;
const suffix = `"]`;
const joinSeparator = `${suffix}${prefix}`;

export const buildKeyToRedact = (parts: string[]): string => {
  if (parts.length === 0) {
    return '';
  }
  return `${prefix}${parts.join(joinSeparator)}${suffix}`;
};

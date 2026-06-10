const PERCENT_DENOMINATOR = 100n;

/**
 * Calculates an integer percentage amount using BigInt arithmetic to avoid floating-point precision drift.
 * Rounding policy: round half up to the nearest integer.
 *
 * @param {number} amount - The base amount to calculate from. Must be a safe integer.
 * @param {number} percentage - The percentage value to apply. Must be a safe integer.
 * @returns {number} The rounded percentage amount as an integer.
 *
 * @example
 * calculatePercentageAmount(150, 85);
 * // 128
 *
 * @example
 * calculatePercentageAmount(151, 85);
 * // 128
 *
 * @example
 * calculatePercentageAmount(152, 85);
 * // 129
 */
export const calculatePercentageAmount = (amount: number, percentage: number): number => {
  if (!Number.isSafeInteger(amount)) {
    throw new Error(`calculatePercentageAmount - amount must be a safe integer. Received: ${amount}`);
  }

  if (!Number.isSafeInteger(percentage)) {
    throw new Error(`calculatePercentageAmount - percentage must be a safe integer. Received: ${percentage}`);
  }

  const numerator = BigInt(amount) * BigInt(percentage);

  const quotient = numerator / PERCENT_DENOMINATOR;
  const remainder = numerator % PERCENT_DENOMINATOR;

  const shouldRoundUp = remainder * 2n >= PERCENT_DENOMINATOR;
  const rounded = shouldRoundUp ? quotient + 1n : quotient;

  return Number(rounded);
};

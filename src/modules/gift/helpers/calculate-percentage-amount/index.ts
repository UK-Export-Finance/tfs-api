const SCALE = 100n; // supports up to 2 decimal places
const PERCENT_DENOMINATOR = 100n;

/**
 * Converts a number with up to 2 decimal places to a scaled BigInt (multiplied by 100).
 *
 * @param {number} value - The value to convert. Supports up to 2 decimal places.
 * @returns {bigint} The value multiplied by 100 as a BigInt.
 *
 * @example
 * toScaledBigInt(150);
 * // 15000n
 *
 * @example
 * toScaledBigInt(100.5);
 * // 10050n
 *
 * @example
 * toScaledBigInt(85.25);
 * // 8525n
 */
export const toScaledBigInt = (value: number): bigint => {
  const [intPart, fracPart = ''] = value.toFixed(2).split('.');

  return BigInt(intPart) * SCALE + BigInt(fracPart);
};

/**
 * Calculates a percentage amount with up to 2 decimal places using BigInt arithmetic to avoid floating-point precision drift.
 * Rounding policy: round half up to 2 decimal places.
 *
 * @param {number} amount - The base amount to calculate from. Supports up to 2 decimal places.
 * @param {number} percentage - The percentage value to apply. Supports up to 2 decimal places.
 * @returns {number} The percentage amount rounded to 2 decimal places.
 *
 * @example
 * calculatePercentageAmount(150, 85);
 * // 127.5
 *
 * @example
 * calculatePercentageAmount(10, 33.35);
 * // 3.34
 *
 * @example
 * calculatePercentageAmount(150, 100);
 * // 150
 */
export const calculatePercentageAmount = (amount: number, percentage: number): number => {
  const scaledAmount = toScaledBigInt(amount);
  const scaledPercentage = toScaledBigInt(percentage);

  const numerator = scaledAmount * scaledPercentage;
  const scaledDenominator = PERCENT_DENOMINATOR * SCALE;

  const quotient = numerator / scaledDenominator;
  const remainder = numerator % scaledDenominator;

  const shouldRoundUp = remainder * 2n >= scaledDenominator;
  const rounded = shouldRoundUp ? quotient + 1n : quotient;

  const integerPart = Number(rounded / SCALE);
  const decimalPart = Number(rounded % SCALE);

  return integerPart + decimalPart / Number(SCALE);
};

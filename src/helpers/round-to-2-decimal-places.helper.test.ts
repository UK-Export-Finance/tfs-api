import { roundTo2DecimalPlaces } from './round-to-2-decimal-places.helper';

describe('roundTo2DecimalPlaces', () => {
  it.each([
    { numberToRound: 1, expectedResult: 1 },
    { numberToRound: 1.2, expectedResult: 1.2 },
    { numberToRound: 1.23, expectedResult: 1.23 },
    { numberToRound: 1.231, expectedResult: 1.23 },
    { numberToRound: 1.232, expectedResult: 1.23 },
    { numberToRound: 1.233, expectedResult: 1.23 },
    { numberToRound: 1.234, expectedResult: 1.23 },
    { numberToRound: 1.235, expectedResult: 1.24 },
    { numberToRound: 1.236, expectedResult: 1.24 },
    { numberToRound: 1.237, expectedResult: 1.24 },
    { numberToRound: 1.238, expectedResult: 1.24 },
    { numberToRound: 1.239, expectedResult: 1.24 },
    { numberToRound: 1234567890.235, expectedResult: 1234567890.24 },
    { numberToRound: 1234567890123.235, expectedResult: 1234567890123.24 },
    { numberToRound: 1.3549999999, expectedResult: 1.35 },
    { numberToRound: 1.3549999999999998, expectedResult: 1.35 },
    // { numberToRound: 1.9949999999999999, expectedResult: 2.0 }, // lodash
    // { numberToRound: 1.9949999999999999, expectedResult: 1.99 }, // mathJs
    { numberToRound: 1 / 3, expectedResult: 0.33 },
    { numberToRound: 10, expectedResult: 10 },
    { numberToRound: Math.E, expectedResult: 2.72 },
    { numberToRound: Math.PI, expectedResult: 3.14 },
    { numberToRound: 0.01 + 0.02, expectedResult: 0.03 },
    { numberToRound: 1.0049999999999999, expectedResult: 1.01 },
    { numberToRound: 1.004999999999999, expectedResult: 1.0 },
    { numberToRound: 1.004999999999998, expectedResult: 1.0 },
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    { numberToRound: 1.0049999999999998, expectedResult: 1.01 },
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    { numberToRound: 1.00499999999999999999999, expectedResult: 1.01 },
    { numberToRound: 1.0049999999999988, expectedResult: 1.0 },
    { numberToRound: 10.004999999999999, expectedResult: 10.0 }, // rounding depends on binary form of float number
    { numberToRound: 19.004999999999999, expectedResult: 19.01 }, // rounding depends on binary form of float number
    { numberToRound: 10.00499999999999, expectedResult: 10.0 },
    { numberToRound: 100.0049999999999, expectedResult: 100.0 }, // 100.00499999999999 is not available because it is too long in binary
    { numberToRound: 1_000.0049999999999, expectedResult: 1_000.0 },
    { numberToRound: 1_000.004999999999, expectedResult: 1_000.0 },
    { numberToRound: 1_000_000_000.0049999, expectedResult: 1_000_000_000.0 },
    { numberToRound: 1_000_000_000.004999, expectedResult: 1_000_000_000.0 },
    { numberToRound: 10_000_000_000.004999, expectedResult: 10_000_000_000.01 },
    { numberToRound: 10_000_000_000.00499, expectedResult: 10_000_000_000.0 },
    { numberToRound: 100_000_000_000.00499, expectedResult: 100_000_000_000.0 },
    { numberToRound: 100_000_000_000.0049, expectedResult: 100_000_000_000.0 },
    { numberToRound: 1_000_000_000_000.0049, expectedResult: 1_000_000_000_000.0 },
    { numberToRound: 1_000_000_000_000.004, expectedResult: 1_000_000_000_000.0 },
    { numberToRound: 1_900_000_000_000.0049, expectedResult: 1_900_000_000_000.01 },
    // { numberToRound: 1_000_000_000_000.004, expectedResult: 1_000_000_000_000.0 },
    { numberToRound: 10_000_000_000_000.004, expectedResult: 10_000_000_000_000.0 },
    { numberToRound: 10_000_000_000_000.04, expectedResult: 10_000_000_000_000.04 },
    { numberToRound: 1.005 / 1.000000000000001, expectedResult: 1.0 }, // Same as 1.0049999999999988
    { numberToRound: 1.005, expectedResult: 1.01 },
    { numberToRound: 1.004 + 0.001, expectedResult: 1.01 },
    { numberToRound: 1.005 / 1.000000000000001, expectedResult: 1.0 },
    // { numberToRound: -1.005, expectedResult: -1.0 }, // lodash
    // //{ numberToRound: -1.005, expectedResult: -1.01 }, // mathjs
    // { numberToRound: -1.445, expectedResult: -1.44 }, // lodash
    // //{ numberToRound: -1.445, expectedResult: -1.45 }, // mathjs
    { numberToRound: 12_345_678_901_234.25, expectedResult: 12_345_678_901_234.25 },
    { numberToRound: 1_234_567_890_123.005, expectedResult: 1_234_567_890_123.01 },
    { numberToRound: 123_456_789_012.005, expectedResult: 123_456_789_012.01 },
    { numberToRound: 12_345_678_901_234.99, expectedResult: 12_345_678_901_234.99 },
    //{ numberToRound: Infinity, expectedResult: Infinity }, // Not supported by decimal light.
    { numberToRound: Number.MAX_SAFE_INTEGER, expectedResult: Number.MAX_SAFE_INTEGER }, // ~9 quadrillion
    //{ numberToRound: Number.MAX_SAFE_INTEGER + 0.005, expectedResult: Number.MAX_SAFE_INTEGER + 0.01 },
    // Max number with 2 decimal places, can be calculated using (Number.MAX_SAFE_INTEGER + 1) / 128 - 1
    { numberToRound: 70_368_744_177_663.99, expectedResult: 70_368_744_177_663.99 },
    // Max number with 3 decimal places
    { numberToRound: 8_796_093_022_207.999, expectedResult: 8796093022208 },
    { numberToRound: 8_796_093_022_207.999, expectedResult: 8_796_093_022_208 },
    { numberToRound: 8_796_093_022_207.015, expectedResult: 8_796_093_022_207.02 },
    { numberToRound: 8_796_093_022_207.014, expectedResult: 8_796_093_022_207.01 },
    { numberToRound: 0b1111, expectedResult: 15.0 },
  ])('rounds the number to 2 decimal places ($numberToRound)', ({ numberToRound, expectedResult }) => {
    expect(roundTo2DecimalPlaces(numberToRound)).toBe(expectedResult);
  });
});

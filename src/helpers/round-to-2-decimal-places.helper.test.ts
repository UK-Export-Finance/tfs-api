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
    { numberToRound: 1.2349999999, expectedResult: 1.23 },
    { numberToRound: 1.3549999999999998, expectedResult: 1.35 },
    { numberToRound: 1 / 3, expectedResult: 0.33 },
    { numberToRound: 10, expectedResult: 10 },
    { numberToRound: Math.E, expectedResult: 2.72 },
    { numberToRound: Math.PI, expectedResult: 3.14 },
    { numberToRound: 0.01 + 0.02, expectedResult: 0.03 },
    { numberToRound: 1.0049999999999999, expectedResult: 1.01 },
    { numberToRound: 1.0049999999999988, expectedResult: 1.0 },
    { numberToRound: 1.005 / 1.000000000000001, expectedResult: 1.0 }, // Same as 1.0049999999999988
    { numberToRound: 1.005, expectedResult: 1.01 },
    { numberToRound: 1.004 + 0.001, expectedResult: 1.01 },
    { numberToRound: 1.005 / 1.000000000000001, expectedResult: 1.0 },
    // { numberToRound: -1.005, expectedResult: -1.0 }, // lodash
    // //{ numberToRound: -1.005, expectedResult: -1.01 }, // mathjs
    // { numberToRound: -1.445, expectedResult: -1.44 },
    // //{ numberToRound: -1.445, expectedResult: -1.45 }, // mathjs
    { numberToRound: 12345678901234.25, expectedResult: 12345678901234.25 },
    { numberToRound: 1234567890123.005, expectedResult: 1234567890123.01 }, // too big if we don't use lib
    { numberToRound: 123456789012.005, expectedResult: 123456789012.01 },
    { numberToRound: 12345678901234.99, expectedResult: 12345678901234.99 },
    //{ numberToRound: Infinity, expectedResult: Infinity }, // Not supported by decimal light.
    { numberToRound: Number.MAX_SAFE_INTEGER, expectedResult: Number.MAX_SAFE_INTEGER }, // ~9 quadrillion
    //{ numberToRound: Number.MAX_SAFE_INTEGER + 0.005, expectedResult: Number.MAX_SAFE_INTEGER + 0.01 },
    // Max number with 2 decimal places, can be calculated using (Number.MAX_SAFE_INTEGER + 1) / 128 - 1
    { numberToRound: 70368744177663.99, expectedResult: 70368744177663.99 },
    // Max number with 3 decimal places
    { numberToRound: 8_796_093_022_207.999, expectedResult: 8796093022208 },
    { numberToRound: 8_796_093_022_207.999, expectedResult: 8_796_093_022_208 },
    { numberToRound: 8796093022207.999, expectedResult: 8796093022208 },
    { numberToRound: 8796093022207.015, expectedResult: 8796093022207.02 },
    { numberToRound: 8796093022207.014, expectedResult: 8796093022207.01 },
  ])('rounds the number to 2 decimal places ($numberToRound)', ({ numberToRound, expectedResult }) => {
    expect(roundTo2DecimalPlaces(numberToRound)).toBe(expectedResult);
  });
});

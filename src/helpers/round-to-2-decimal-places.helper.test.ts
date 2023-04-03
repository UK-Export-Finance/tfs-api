import { roundTo2DecimalPlaces } from './round-to-2-decimal-places.helper';

describe('roundTo2DecimalPlaces', () => {
  it.each([
    { numberToRound: 1, expectedResult: 1 },
    { numberToRound: 1.2, expectedResult: 1.2 },
    { numberToRound: 1.23, expectedResult: 1.23 },
    { numberToRound: 1.234, expectedResult: 1.23 },
    { numberToRound: 1.235, expectedResult: 1.24 },
    { numberToRound: 1.2349999999, expectedResult: 1.23 },
    { numberToRound: 10, expectedResult: 10 },
  ])('rounds the number to 2 decimal places ($numberToRound)', ({ numberToRound, expectedResult }) => {
    expect(roundTo2DecimalPlaces(numberToRound)).toBe(expectedResult);
  });

  it('does NOT round to 2 decimal places correctly for some numbers with imprecise float representations', () => {
    expect(roundTo2DecimalPlaces(1.005)).toBe(1);
  });
});

import { calculatePercentageAmount } from '.';

describe('modules/gift/helpers/calculate-percentage-amount', () => {
  describe('rounding behaviour', () => {
    describe('when rounding is exactly half or close to half', () => {
      it('should round half up to the nearest integer', () => {
        // Act
        const resultOne = calculatePercentageAmount(150, 85);
        const resultTwo = calculatePercentageAmount(151, 85);
        const resultThree = calculatePercentageAmount(152, 85);

        // Assert
        expect(resultOne).toBe(128);
        expect(resultTwo).toBe(128);
        expect(resultThree).toBe(129);
      });
    });

    describe('when amount is very large', () => {
      it('should calculate large values without floating-point precision drift', () => {
        // Act
        const result = calculatePercentageAmount(Number.MAX_SAFE_INTEGER, 85);

        // Assert
        const expected = 7656119366529842;

        expect(result).toBe(expected);
      });
    });
  });

  describe('when amount is not a safe integer', () => {
    it('should throw an error', () => {
      // Act
      const result = () => calculatePercentageAmount(100.5, 85);

      // Assert
      const expected = 'calculatePercentageAmount - amount must be a safe integer. Received: 100.5';

      expect(result).toThrow(expected);
    });
  });

  describe('when percentage is not a safe integer', () => {
    it('should throw an error', () => {
      // Act
      const result = () => calculatePercentageAmount(100, 85.5);

      // Assert
      const expected = 'calculatePercentageAmount - percentage must be a safe integer. Received: 85.5';

      expect(result).toThrow(expected);
    });
  });
});

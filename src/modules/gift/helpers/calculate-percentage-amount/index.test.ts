import { calculatePercentageAmount } from '.';

describe('modules/gift/helpers/calculate-percentage-amount', () => {
  describe('rounding behaviour', () => {
    describe('when the third decimal place is exactly half', () => {
      it('should round half up to 2 decimal places', () => {
        // Act
        const result = calculatePercentageAmount(10, 33.35);

        // Assert
        expect(result).toBe(3.34);
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

  describe('when amount has 2 decimal places', () => {
    it('should calculate correctly', () => {
      // Act
      const result = calculatePercentageAmount(100.5, 85);

      // Assert
      expect(result).toBe(85.43);
    });
  });

  describe('when percentage has 2 decimal places', () => {
    it('should calculate correctly', () => {
      // Act
      const result = calculatePercentageAmount(100, 85.5);

      // Assert
      expect(result).toBe(85.5);
    });
  });
});

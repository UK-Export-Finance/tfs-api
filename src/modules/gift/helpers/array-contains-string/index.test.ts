import { arrayContainsString } from '.';

describe('modules/gift/helpers/array-contains-strings', () => {
  describe('when an array contains the provided string', () => {
    it('should return true', () => {
      // Arrange
      const mockArray = ['a', 'b', 'c'];

      // Act
      const result = arrayContainsString(mockArray, 'b');

      // Asset
      expect(result).toBe(true);
    });
  });

  describe('when an array contains the provided string - alternative unicode strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArray = ['$', '£', '@', 'à', 'á', 'a'];

      // Act
      const result = arrayContainsString(mockArray, '@');

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when an array does NOT contain the provided string', () => {
    it('should return false', () => {
      // Arrange
      const mockArray = ['a', 'b', 'c'];

      // Act
      const result = arrayContainsString(mockArray, 'x');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      // Arrange
      const mockArray = [];

      // Act
      const result = arrayContainsString(mockArray, 'a');

      // Assert
      expect(result).toBe(false);
    });
  });
});

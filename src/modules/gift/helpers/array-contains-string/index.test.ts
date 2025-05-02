import { arrayContainsString } from '.';

describe('modules/gift/helpers/array-contains-strings', () => {
  describe('when an array contains the provided string', () => {
    it('should return true', () => {
      // Arrange
      const mockArr = ['a', 'b', 'c'];

      // Act
      const result = arrayContainsString(mockArr, 'b');

      // Asset
      expect(result).toBe(true);
    });
  });

  describe('when an array contains the provided string - alternative unicode strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArr = ['$', '£', '@', 'à', 'á', 'a'];

      // Act
      const result = arrayContainsString(mockArr, '@');

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when an array does NOT contain the provided string', () => {
    it('should return false', () => {
      // Arrange
      const mockArr = ['a', 'b', 'c'];

      // Act
      const result = arrayContainsString(mockArr, 'x');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      // Arrange
      const mockArr = [];

      // Act
      const result = arrayContainsString(mockArr, 'a');

      // Assert
      expect(result).toBe(false);
    });
  });
});

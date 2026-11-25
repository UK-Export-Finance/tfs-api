import { arrayHasUniqueStrings } from '.';

describe('modules/gift/helpers/array-has-unique-strings', () => {
  describe('when an array has unique strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArray = ['a', 'b', 'c'];

      // Act
      const result = arrayHasUniqueStrings(mockArray);

      // Asset
      expect(result).toBe(true);
    });
  });

  describe('when an array has unique strings - alternative unicode strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArray = ['$', '£', '@', 'à', 'á', 'a'];

      // Act
      const result = arrayHasUniqueStrings(mockArray);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when an array does NOT have unique strings', () => {
    it('should return false', () => {
      // Arrange
      const mockArray = ['a', 'a', 'c'];

      // Act
      const result = arrayHasUniqueStrings(mockArray);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      // Arrange
      const mockArray = [];

      // Act
      const result = arrayHasUniqueStrings(mockArray);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array has only one entry', () => {
    it('should return true', () => {
      // Arrange
      const mockArray = ['a'];

      // Act
      const result = arrayHasUniqueStrings(mockArray);

      // Assert
      expect(result).toBe(true);
    });
  });
});

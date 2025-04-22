import { arrayHasUniqueStrings } from '.';

describe('modules/gift/helpers/array-has-unique-strings', () => {
  describe('when an array has unique strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArr = ['a', 'b', 'c'];

      // Act
      const result = arrayHasUniqueStrings(mockArr);

      // Asset
      expect(result).toBe(true);
    });
  });

  describe('when an array has unique strings - alternative unicode strings', () => {
    it('should return true', () => {
      // Arrange
      const mockArr = ['$', '£', '@', 'à', 'á', 'a'];

      // Act
      const result = arrayHasUniqueStrings(mockArr);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when an array does NOT have unique strings', () => {
    it('should return false', () => {
      // Arrange
      const mockArr = ['a', 'a', 'c'];

      // Act
      const result = arrayHasUniqueStrings(mockArr);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      // Arrange
      const mockArr = [];

      // Act
      const result = arrayHasUniqueStrings(mockArr);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array has only one entry', () => {
    it('should return true', () => {
      // Arrange
      const mockArr = ['a'];

      // Act
      const result = arrayHasUniqueStrings(mockArr);

      // Assert
      expect(result).toBe(true);
    });
  });
});

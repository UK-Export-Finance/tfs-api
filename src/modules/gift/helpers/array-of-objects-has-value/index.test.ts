import { arrayOfObjectsHasValue } from '.';

describe('modules/gift/helpers/array-of-objects-has-value', () => {
  describe('when an array contains an object with the provided field name and value', () => {
    it('should return true', () => {
      // Arrange
      const mockFieldName = 'a';
      const mockFieldValue = 'Mock value';

      const mockArray = [{ [mockFieldName]: mockFieldValue }];

      // Act
      const result = arrayOfObjectsHasValue(mockArray, mockFieldName, mockFieldValue);

      // Asset
      expect(result).toBe(true);
    });
  });

  describe('when an array contains an object with the provided field name, but not the value', () => {
    it('should return false', () => {
      // Arrange
      const mockFieldName = 'a';
      const mockFieldValue = 'Mock value';

      const mockArray = [{ [mockFieldName]: mockFieldValue }];

      // Act
      const result = arrayOfObjectsHasValue(mockArray, mockFieldName, `${mockFieldValue}-a`);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array does NOT contain an object with the provided field name', () => {
    it('should return false', () => {
      // Arrange
      const mockFieldName = 'a';
      const mockFieldValue = 'Mock value';

      const mockArray = [{ [mockFieldName]: mockFieldValue }];

      // Act
      const result = arrayOfObjectsHasValue(mockArray, `${mockFieldName}-a`, mockFieldValue);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      // Arrange
      const mockArray = [];

      // Act
      const result = arrayOfObjectsHasValue(mockArray, 'a', 'b');

      // Assert
      expect(result).toBe(false);
    });
  });
});

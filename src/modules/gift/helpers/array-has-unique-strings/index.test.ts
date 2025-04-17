import { arrayHasUniqueStrings } from '.';

describe('modules/gift/helpers/array-has-unique-strings', () => {
  describe('when an array has unique strings', () => {
    it('should return true', () => {
      const mockArr = ['a', 'b', 'c'];

      const result = arrayHasUniqueStrings(mockArr);

      expect(result).toBe(true);
    });
  });

  describe('when an array has unique strings - alternative unicode strings', () => {
    it('should return true', () => {
      const mockArr = ['$', '£', '@', 'à', 'á', 'a'];

      const result = arrayHasUniqueStrings(mockArr);

      expect(result).toBe(true);
    });
  });

  describe('when an array does NOT have unique strings', () => {
    it('should return false', () => {
      const mockArr = ['a', 'a', 'c'];

      const result = arrayHasUniqueStrings(mockArr);

      expect(result).toBe(false);
    });
  });

  describe('when an array is empty', () => {
    it('should return false', () => {
      const result = arrayHasUniqueStrings([]);

      expect(result).toBe(false);
    });
  });

  describe('when an array has only one entry', () => {
    it('should return true', () => {
      const mockArr = ['a'];

      const result = arrayHasUniqueStrings(mockArr);

      expect(result).toBe(true);
    });
  });
});

import { EXAMPLES, GIFT } from '@ukef/constants';

import { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { hasUniqueRepaymentProfileNames } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

const {
  VALIDATION: {
    REPAYMENT_PROFILE: {
      NAME: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

describe('modules/gift/helpers/has-unique-repayment-profile-names', () => {
  describe('when repayment profiles are NOT provided', () => {
    it('should return true', () => {
      // Act
      const result = hasUniqueRepaymentProfileNames();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profiles is an empty array', () => {
    it('should return true', () => {
      // Act
      const result = hasUniqueRepaymentProfileNames([]);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when all repayment profile names are unique', () => {
    it('should return true', () => {
      // Arrange
      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        { ...REPAYMENT_PROFILE(), name: 'a' },
        { ...REPAYMENT_PROFILE(), name: 'b' },
      ];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profile names are duplicated', () => {
    it('should return false', () => {
      // Arrange
      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        { ...REPAYMENT_PROFILE(), name: 'a duplicate name' },
        { ...REPAYMENT_PROFILE(), name: 'a duplicate name' },
      ];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when repayment profile names are duplicated, but are NOT valid (e.g, null)', () => {
    it('should return true, since invalid names are excluded from the uniqueness check', () => {
      // Arrange
      const mockRepaymentProfiles = [
        { ...REPAYMENT_PROFILE(), name: null },
        { ...REPAYMENT_PROFILE(), name: null },
      ] as unknown as GiftRepaymentProfileRequestDto[];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profile names are duplicated, but are too short to be valid', () => {
    it('should return true, since invalid names are excluded from the uniqueness check', () => {
      // Arrange
      const invalidName = 'a'.repeat(MIN_LENGTH - 1);

      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        { ...REPAYMENT_PROFILE(), name: invalidName },
        { ...REPAYMENT_PROFILE(), name: invalidName },
      ];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profile names are duplicated, but are too long to be valid', () => {
    it('should return true, since invalid names are excluded from the uniqueness check', () => {
      // Arrange
      const invalidName = 'a'.repeat(MAX_LENGTH + 1);

      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        { ...REPAYMENT_PROFILE(), name: invalidName },
        { ...REPAYMENT_PROFILE(), name: invalidName },
      ];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profile names are duplicated and contain unicode surrogate pairs (e.g, emoji)', () => {
    it('should return false', () => {
      /**
       * Regression test.
       * `name.length` (native JS) counts UTF-16 code units, so a string of 61 emoji has `name.length === 122`.
       * This is still a valid name as per the DTO's `@Length(1, 120)` decorator, which (via class-validator's
       * `isLength`) accounts for surrogate pairs and therefore treats this string as having a length of 61.
       * Therefore, this duplicate, valid name must be correctly detected as a duplicate, instead of being
       * incorrectly excluded from the uniqueness check.
       */
      // Arrange
      const duplicateNameWithEmoji = '😀'.repeat(61);

      expect(duplicateNameWithEmoji.length).toBe(122);
      expect(duplicateNameWithEmoji.length).toBeGreaterThan(MAX_LENGTH);

      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        { ...REPAYMENT_PROFILE(), name: duplicateNameWithEmoji },
        { ...REPAYMENT_PROFILE(), name: duplicateNameWithEmoji },
      ];

      // Act
      const result = hasUniqueRepaymentProfileNames(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(false);
    });
  });
});

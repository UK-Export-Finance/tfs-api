import { EXAMPLES } from '@ukef/constants';

import { GiftRepaymentProfileRequestDto } from '@ukef/modules/gift/dto';
import { hasUniqueRepaymentProfileAllocationDates } from '.';

const {
  GIFT: { REPAYMENT_PROFILE },
} = EXAMPLES;

describe('modules/gift/helpers/has-unique-repayment-profile-allocation-dates', () => {
  describe('when repayment profiles are NOT provided', () => {
    it('should return true', () => {
      // Act
      const result = hasUniqueRepaymentProfileAllocationDates();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when repayment profiles is an empty array', () => {
    it('should return true', () => {
      // Act
      const result = hasUniqueRepaymentProfileAllocationDates([]);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when a repayment profile has no allocations', () => {
    it('should return true', () => {
      // Arrange
      const mockRepaymentProfiles = [{ ...REPAYMENT_PROFILE(), allocations: undefined }] as unknown as GiftRepaymentProfileRequestDto[];

      // Act
      const result = hasUniqueRepaymentProfileAllocationDates(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when all allocation dueDates are unique', () => {
    it('should return true', () => {
      // Arrange
      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        {
          ...REPAYMENT_PROFILE(),
          allocations: [
            { amount: 1, dueDate: '2025-01-01' },
            { amount: 1, dueDate: '2025-02-01' },
          ],
        },
      ];

      // Act
      const result = hasUniqueRepaymentProfileAllocationDates(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when allocation dueDates are duplicated', () => {
    it('should return false', () => {
      // Arrange
      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        {
          ...REPAYMENT_PROFILE(),
          allocations: [
            { amount: 1, dueDate: '2025-01-01' },
            { amount: 1, dueDate: '2025-01-01' },
          ],
        },
      ];

      // Act
      const result = hasUniqueRepaymentProfileAllocationDates(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('when allocation dueDates are duplicated, but are NOT valid (e.g, null)', () => {
    it('should return true, since invalid dueDates are excluded from the uniqueness check', () => {
      // Arrange
      const mockRepaymentProfiles = [
        {
          ...REPAYMENT_PROFILE(),
          allocations: [
            { amount: 1, dueDate: null },
            { amount: 1, dueDate: null },
          ],
        },
      ] as unknown as GiftRepaymentProfileRequestDto[];

      // Act
      const result = hasUniqueRepaymentProfileAllocationDates(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when allocation dueDates are duplicated, but are NOT valid ISO 8601 date strings', () => {
    it('should return true, since invalid dueDates are excluded from the uniqueness check', () => {
      // Arrange
      const mockRepaymentProfiles: GiftRepaymentProfileRequestDto[] = [
        {
          ...REPAYMENT_PROFILE(),
          allocations: [
            { amount: 1, dueDate: 'not-a-date' },
            { amount: 1, dueDate: 'not-a-date' },
          ],
        },
      ];

      // Act
      const result = hasUniqueRepaymentProfileAllocationDates(mockRepaymentProfiles);

      // Assert
      expect(result).toBe(true);
    });
  });
});

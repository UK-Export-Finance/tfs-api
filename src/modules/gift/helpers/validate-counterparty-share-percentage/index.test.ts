import { GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRoleDto } from '../../dto';
import { validateCounterpartySharePercentage } from '.';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

const mockRoles: GiftFacilityCounterpartyRoleDto[] = [
  {
    id: '1',
    displayText: 'Role 1',
    hasShare: false,
  },
  {
    id: '2',
    displayText: 'Role 2',
    hasShare: true,
  },
  {
    id: '3',
    displayText: 'Role 3',
    hasShare: false,
  },
];

describe('modules/gift/helpers/validate-counterparty-share-percentage', () => {
  describe('when no role is found', () => {
    it('should return true', () => {
      // Arrange
      const mockRoleId = '4';

      // Act
      const result = validateCounterpartySharePercentage({
        roles: mockRoles,
        roleId: mockRoleId,
      });

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when a role is found and does NOT have hasShare', () => {
    it('should return true', () => {
      // Arrange
      const mockRoleId = '3';

      // Act
      const result = validateCounterpartySharePercentage({
        roles: mockRoles,
        roleId: mockRoleId,
      });

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when a role is found and does have hasShare', () => {
    describe('when the provided sharePercentage is NOT a number', () => {
      it.each(['10', null, undefined, true, false, {}, []])('should return false', (sharePercentage) => {
        // Arrange
        const mockRoleId = '2';

        // Act
        const result = validateCounterpartySharePercentage({
          roles: mockRoles,
          roleId: mockRoleId,
          sharePercentage,
        });

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when the provided sharePercentage is a number', () => {
      describe(`when the percentage is below ${MIN}`, () => {
        it('should return false', () => {
          // Arrange
          const mockRoleId = '2';
          const mockSharePercentage = MIN - 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleId: mockRoleId,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(false);
        });
      });

      describe(`when the percentage is above ${MAX}`, () => {
        it('should return false', () => {
          // Arrange
          const mockRoleId = '2';
          const mockSharePercentage = MAX + 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleId: mockRoleId,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(false);
        });
      });

      describe(`when the percentage is between ${MIN} and ${MAX}`, () => {
        it('should return true', () => {
          // Arrange
          const mockRoleId = '2';
          const mockSharePercentage = MIN + 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleId: mockRoleId,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(true);
        });
      });
    });
  });
});

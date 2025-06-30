import { GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRoleResponseDto } from '../../dto';
import { validateCounterpartySharePercentage } from '.';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

const mockRoles: GiftFacilityCounterpartyRoleResponseDto[] = [
  {
    code: '1',
    name: 'Role 1',
    hasSharePercentage: false,
  },
  {
    code: '2',
    name: 'Role 2',
    hasSharePercentage: true,
  },
  {
    code: '3',
    name: 'Role 3',
    hasSharePercentage: false,
  },
];

describe('modules/gift/helpers/validate-counterparty-share-percentage', () => {
  describe('when no role is found', () => {
    it('should return true', () => {
      // Arrange
      const mockRoleCode = '4';

      // Act
      const result = validateCounterpartySharePercentage({
        roles: mockRoles,
        roleCode: mockRoleCode,
      });

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when a role is found and does NOT have hasSharePercentage', () => {
    it('should return true', () => {
      // Arrange
      const mockRoleCode = '3';

      // Act
      const result = validateCounterpartySharePercentage({
        roles: mockRoles,
        roleCode: mockRoleCode,
      });

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when a role is found and does have hasSharePercentage', () => {
    describe('when the provided sharePercentage is NOT a number', () => {
      it.each(['10', null, undefined, true, false, {}, []])('should return false', (sharePercentage) => {
        // Arrange
        const mockRoleCode = '2';

        // Act
        const result = validateCounterpartySharePercentage({
          roles: mockRoles,
          roleCode: mockRoleCode,
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
          const mockRoleCode = '2';
          const mockSharePercentage = MIN - 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleCode: mockRoleCode,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(false);
        });
      });

      describe(`when the percentage is above ${MAX}`, () => {
        it('should return false', () => {
          // Arrange
          const mockRoleCode = '2';
          const mockSharePercentage = MAX + 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleCode: mockRoleCode,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(false);
        });
      });

      describe(`when the percentage is between ${MIN} and ${MAX}`, () => {
        it('should return true', () => {
          // Arrange
          const mockRoleCode = '2';
          const mockSharePercentage = MIN + 1;

          // Act
          const result = validateCounterpartySharePercentage({
            roles: mockRoles,
            roleCode: mockRoleCode,
            sharePercentage: mockSharePercentage,
          });

          // Assert
          expect(result).toBe(true);
        });
      });
    });
  });
});

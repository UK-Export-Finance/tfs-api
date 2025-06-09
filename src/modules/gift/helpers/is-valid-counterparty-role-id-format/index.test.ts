import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';

import { isValidCounterpartyRoleIdFormat } from '.';

const {
  VALIDATION: {
    COUNTERPARTY: {
      ROLE_ID: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

describe('modules/gift/helpers/is-valid-counterparty-role-id-format', () => {
  describe('when a role ID is not provided', () => {
    it('should return false', () => {
      // Act
      const result = isValidCounterpartyRoleIdFormat();

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when an empty role ID is provided', () => {
    it('should return false', () => {
      // Act
      const result = isValidCounterpartyRoleIdFormat('');

      // Asset
      expect(result).toBe(false);
    });
  });

  describe(`when a role ID is less than ${MIN_LENGTH}`, () => {
    it('should return false', () => {
      // Arrange
      const mockRoleId = 'a'.repeat(MIN_LENGTH - 1);

      // Act
      const result = isValidCounterpartyRoleIdFormat(mockRoleId);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe(`when a role ID is greater than ${MAX_LENGTH}`, () => {
    it('should return false', () => {
      // Arrange
      const mockRoleId = 'a'.repeat(MAX_LENGTH - 1);

      // Act
      const result = isValidCounterpartyRoleIdFormat(mockRoleId);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a role ID is has the correct format', () => {
    it('should return true', () => {
      // Arrange
      const mockRoleId = GIFT_EXAMPLES.COUNTERPARTY_ROLE.GUARANTOR.id;

      // Act
      const result = isValidCounterpartyRoleIdFormat(mockRoleId);

      // Asset
      expect(result).toBe(false);
    });
  });
});

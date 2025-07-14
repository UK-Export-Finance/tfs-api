import { EXAMPLES, GIFT } from '@ukef/constants';

import { GiftFacilityCounterpartyRoleResponseDto } from '../../dto';
import { generateCounterpartySharePercentageErrors } from '.';

const {
  VALIDATION: {
    COUNTERPARTY: {
      SHARE_PERCENTAGE: { MIN, MAX },
    },
  },
} = GIFT;

const mockCounterpartyRoles: GiftFacilityCounterpartyRoleResponseDto[] = [
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

describe('modules/gift/helpers/generate-counterparty-share-percentage-errors', () => {
  describe('when all provided roles require a sharePercentage, but are not provided', () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedRoles = [
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2' },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2' },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2' },
      ];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      const expected = [
        `counterparties.0.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`,
        `counterparties.1.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`,
        `counterparties.2.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`,
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe(`when a provided role requires a sharePercentage, is provided and below ${MIN}`, () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedRoles = [{ ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2', sharePercentage: MIN - 1 }];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      const expected = [`counterparties.0.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`];

      expect(result).toStrictEqual(expected);
    });
  });

  describe(`when a provided role requires a sharePercentage, is provided and above ${MAX}`, () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedRoles = [{ ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2', sharePercentage: MAX + 1 }];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      const expected = [`counterparties.0.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`];

      expect(result).toStrictEqual(expected);
    });
  });

  describe(`when a provided role requires a sharePercentage, is provided and between ${MIN} and ${MAX}`, () => {
    it('should return an empty array', () => {
      // Arrange
      const mockProvidedRoles = [{ ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2', sharePercentage: MAX - 1 }];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      expect(result).toStrictEqual([]);
    });
  });

  describe('when one provided role requires a sharePercentage, but is not provided', () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedRoles = [
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '1' },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '2', sharePercentage: null },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '3' },
      ];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      const expected = [`counterparties.1.sharePercentage must be a provided as a number, at least ${MIN} and not greater than ${MAX}`];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when no provided roles require a sharePercentage', () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedRoles = [
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '1' },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '1' },
        { ...EXAMPLES.GIFT.COUNTERPARTY(), roleCode: '1' },
      ];

      // Act
      const result = generateCounterpartySharePercentageErrors({
        counterpartyRoles: mockCounterpartyRoles,
        providedCounterparties: mockProvidedRoles,
      });

      // Assert
      expect(result).toStrictEqual([]);
    });
  });
});

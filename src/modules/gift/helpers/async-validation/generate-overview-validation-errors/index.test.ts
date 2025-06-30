import { EXAMPLES } from '@ukef/constants';
import { SUPPORTED_CURRENCIES } from '@ukef/constants/currencies.constant';

import { generateOverviewValidationErrors } from '.';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

describe('modules/gift/helpers/async-validation/generate-overview-validation-errors', () => {
  describe('when payload.currency is NOT in the supported currencies array', () => {
    it('should return an array with validation error', () => {
      // Arrange
      const mockPayload = {
        ...FACILITY_CREATION_PAYLOAD.overview,
        currency: SUPPORTED_CURRENCIES.USD,
      };

      const mockSupportedCurrencies = [SUPPORTED_CURRENCIES.GBP];

      // Act
      const result = generateOverviewValidationErrors(mockPayload, mockSupportedCurrencies);

      // Assert
      const expected = [`overview.currency is not supported - ${SUPPORTED_CURRENCIES.USD}`];

      expect(result).toEqual(expected);
    });
  });

  describe('when payload.currency is in the supported currencies array', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockPayload = {
        ...FACILITY_CREATION_PAYLOAD.overview,
        currency: SUPPORTED_CURRENCIES.GBP,
      };

      const mockSupportedCurrencies = [SUPPORTED_CURRENCIES.GBP];

      // Act
      const result = generateOverviewValidationErrors(mockPayload, mockSupportedCurrencies);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

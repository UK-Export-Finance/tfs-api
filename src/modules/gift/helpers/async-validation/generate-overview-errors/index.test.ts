import { EXAMPLES } from '@ukef/constants';
import { SUPPORTED_CURRENCIES } from '@ukef/constants/currencies.constant';

import { generateOverviewErrors } from '.';

const {
  GIFT: { FACILITY_CREATION_PAYLOAD },
} = EXAMPLES;

describe('modules/gift/helpers/async-validation/generate-overview-errors', () => {
  describe('when payload.currency is NOT in the supported currencies array', () => {
    it('should return an array with validation error', () => {
      // Arrange
      const mockPayload = {
        ...FACILITY_CREATION_PAYLOAD.overview,
        currency: SUPPORTED_CURRENCIES.USD,
      };

      const mockSupportedCurrencies = [SUPPORTED_CURRENCIES.GBP];

      // Act
      const result = generateOverviewErrors({
        isSupportedProductType: true,
        payload: mockPayload,
        supportedCurrencies: mockSupportedCurrencies,
      });

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
      const result = generateOverviewErrors({
        isSupportedProductType: true,
        payload: mockPayload,
        supportedCurrencies: mockSupportedCurrencies,
      });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('when isSupportedProductType is false', () => {
    it('should return an array with validation error', () => {
      // Arrange
      const mockPayload = FACILITY_CREATION_PAYLOAD.overview;

      const mockSupportedCurrencies = Object.values(SUPPORTED_CURRENCIES);

      // Act
      const result = generateOverviewErrors({
        isSupportedProductType: false,
        payload: mockPayload,
        supportedCurrencies: mockSupportedCurrencies,
      });

      // Assert
      const expected = [`overview.productTypeCode is not supported - ${mockPayload.productTypeCode}`];

      expect(result).toEqual(expected);
    });
  });

  describe('when all validation errors occur', () => {
    it('should return an array with multiple validation errors', () => {
      // Arrange
      const mockPayload = FACILITY_CREATION_PAYLOAD.overview;

      // Act
      const result = generateOverviewErrors({
        isSupportedProductType: false,
        payload: mockPayload,
        supportedCurrencies: [],
      });

      // Assert
      const expected = [
        `overview.currency is not supported - ${SUPPORTED_CURRENCIES.USD}`,
        `overview.productTypeCode is not supported - ${mockPayload.productTypeCode}`,
      ];

      expect(result).toEqual(expected);
    });
  });
});

import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';

import { isValidProductTypeCodeFormat } from '.';

const {
  VALIDATION: {
    FACILITY: {
      OVERVIEW: {
        PRODUCT_TYPE_CODE: { MIN_LENGTH, MAX_LENGTH },
      },
    },
  },
} = GIFT;

describe('modules/gift/helpers/is-valid-product-type-code-format', () => {
  describe('when a product type code is not provided', () => {
    it('should return false', () => {
      // Act
      const result = isValidProductTypeCodeFormat();

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when an empty product type code is provided', () => {
    it('should return false', () => {
      // Act
      const result = isValidProductTypeCodeFormat('');

      // Asset
      expect(result).toBe(false);
    });
  });

  describe(`when a product type code is less than ${MIN_LENGTH}`, () => {
    it('should return false', () => {
      // Arrange
      const mockProductTypeCode = 'a'.repeat(MIN_LENGTH - 1);

      // Act
      const result = isValidProductTypeCodeFormat(mockProductTypeCode);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe(`when a product type code is greater than ${MAX_LENGTH}`, () => {
    it('should return false', () => {
      // Arrange
      const mockProductTypeCode = 'a'.repeat(MAX_LENGTH + 1);

      // Act
      const result = isValidProductTypeCodeFormat(mockProductTypeCode);

      // Asset
      expect(result).toBe(false);
    });
  });

  describe('when a product type code is has the correct format', () => {
    it('should return true', () => {
      // Arrange
      const mockProductTypeCode = GIFT_EXAMPLES.FACILITY_OVERVIEW.productTypeCode;

      // Act
      const result = isValidProductTypeCodeFormat(mockProductTypeCode);

      // Asset
      expect(result).toBe(true);
    });
  });
});

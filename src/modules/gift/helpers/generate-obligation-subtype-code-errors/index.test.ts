import { EXAMPLES } from '@ukef/constants';

import { generateObligationSubtypeCodeErrors } from '.';

const mockProductTypeCode = 'Mock product 1';
const { OBLIGATION_SUBTYPES, OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA } = EXAMPLES.MDM;

const mockSubtypes = OBLIGATION_SUBTYPES_WITH_PRODUCT_CODES_RESPONSE_DATA;

describe('modules/gift/helpers/generate-obligation-subtype-code-errors', () => {
  describe('when all provided subtype codes are not supported', () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedObligations = [
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '100' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '200' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '300' },
      ];

      // Act
      const result = generateObligationSubtypeCodeErrors({
        subtypes: mockSubtypes,
        productTypeCode: mockProductTypeCode,
        providedObligations: mockProvidedObligations,
      });

      // Assert
      const expected = [
        `obligations.0.subtypeCode is not supported by product type ${mockProductTypeCode}`,
        `obligations.1.subtypeCode is not supported by product type ${mockProductTypeCode}`,
        `obligations.2.subtypeCode is not supported by product type ${mockProductTypeCode}`,
      ];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when one provided subtype code is not supported', () => {
    it('should return an array with validation errors', () => {
      // Arrange
      const mockProvidedObligations = [
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: OBLIGATION_SUBTYPES.OST001.code },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '200' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: OBLIGATION_SUBTYPES.OST012.code },
      ];

      // Act
      const result = generateObligationSubtypeCodeErrors({
        subtypes: mockSubtypes,
        productTypeCode: mockProductTypeCode,
        providedObligations: mockProvidedObligations,
      });

      // Assert
      const expected = [`obligations.1.subtypeCode is not supported by product type ${mockProductTypeCode}`];

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when all provided subtype codes are supported', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockProvidedObligations = [
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: OBLIGATION_SUBTYPES.OST001.code },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: OBLIGATION_SUBTYPES.OST009.code },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: OBLIGATION_SUBTYPES.OST012.code },
      ];

      // Act
      const result = generateObligationSubtypeCodeErrors({
        subtypes: mockSubtypes,
        productTypeCode: mockProductTypeCode,
        providedObligations: mockProvidedObligations,
      });

      // Assert
      expect(result).toStrictEqual([]);
    });
  });
});

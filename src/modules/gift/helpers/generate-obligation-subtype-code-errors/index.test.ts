import { EXAMPLES } from '@ukef/constants';

import { generateObligationSubtypeCodeErrors } from '.';

const mockProductTypeCode = 'Mock product 1';

const mockSubtypes = EXAMPLES.MDM.OBLIGATION_SUBTYPES_RESPONSE_DATA;

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
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '1' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '200' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '3' },
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

  describe('when one provided subtype codes are supported', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockProvidedObligations = [
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '1' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '2' },
        { ...EXAMPLES.GIFT.OBLIGATION(), subtypeCode: '3' },
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

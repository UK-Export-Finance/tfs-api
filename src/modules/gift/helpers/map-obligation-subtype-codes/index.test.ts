import { GiftObligationRequestDto } from '../../dto';
import { getObligationSubtypeCodes } from '.';

describe('modules/gift/helpers/map-obligation-subtype-codes', () => {
  describe('getObligationSubtypeCodes', () => {
    it('should return an array of obligation subtype codes', () => {
      // Arrange
      const mockObligations = [
        { amount: 100, subtypeCode: 'A' },
        { amount: 100, subtypeCode: 'B' },
        { amount: 100, subtypeCode: 'C' },
      ] as GiftObligationRequestDto[];

      // Act
      const result = getObligationSubtypeCodes(mockObligations);

      // Assert
      const expected = ['A', 'B', 'C'];

      expect(result).toStrictEqual(expected);
    });

    it('should return an array of obligation subtype codes, excluding empty, whitespace-only, null subtype codes', () => {
      // Arrange
      const mockObligations = [
        { amount: 100, subtypeCode: 'A' },
        { amount: 100, subtypeCode: '' },
        { amount: 100, subtypeCode: '   ' },
        { amount: 100, subtypeCode: 'B' },
        { amount: 100, subtypeCode: 'C' },
        { amount: 100, subtypeCode: null },
      ] as GiftObligationRequestDto[];

      // Act
      const result = getObligationSubtypeCodes(mockObligations);

      // Assert
      const expected = ['A', 'B', 'C'];

      expect(result).toStrictEqual(expected);
    });
  });
});

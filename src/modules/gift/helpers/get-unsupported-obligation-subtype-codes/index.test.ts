import { EXAMPLES, GIFT } from '@ukef/constants';

import { GiftObligationDto } from '../../dto';
import { getUnsupportedObligationSubtypeCodes } from '.';

const {
  GIFT: { OBLIGATION },
} = EXAMPLES;

const { OBLIGATION_SUBTYPES } = GIFT;

const mockObligations: GiftObligationDto[] = [OBLIGATION(), OBLIGATION()];

describe('modules/gift/helpers/get-unsupported-obligation-subtype-codes', () => {
  describe('when all obligation subtype codes are supported', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockSupportedSubtypes = Object.values(OBLIGATION_SUBTYPES);

      // Act
      const result = getUnsupportedObligationSubtypeCodes({
        obligations: mockObligations,
        supportedSubtypes: mockSupportedSubtypes,
      });

      // Assert
      expect(result).toStrictEqual([]);
    });

    describe('when an obligation subtype code is NOT supported', () => {
      it('should return an array of the unsupported subtype codes', () => {
        // Arrange
        const mockSupportedSubtypes = [OBLIGATION_SUBTYPES.EXP01];

        // Act
        const result = getUnsupportedObligationSubtypeCodes({
          obligations: [OBLIGATION({ subtypeCode: OBLIGATION_SUBTYPES.EXP01.code }), OBLIGATION({ subtypeCode: OBLIGATION_SUBTYPES.EXP02.code })],
          supportedSubtypes: mockSupportedSubtypes,
        });

        // Assert
        const expected = [OBLIGATION_SUBTYPES.EXP02.code];

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when multiple obligation subtype codes are NOT supported', () => {
      it('should return an array of the unsupported subtype codes', () => {
        // Arrange
        const mockSupportedSubtypes = [{ ...OBLIGATION_SUBTYPES.BIP02, code: 'MOCK-SUPPORTED' }];

        // Act
        const result = getUnsupportedObligationSubtypeCodes({
          obligations: mockObligations,
          supportedSubtypes: mockSupportedSubtypes,
        });

        // Assert
        const expected = [OBLIGATION().subtypeCode, OBLIGATION().subtypeCode];

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when the provided obligations is an empty array', () => {
      it('should return an empty array', () => {
        // Arrange
        const mockSupportedSubtypes = Object.values(OBLIGATION_SUBTYPES);

        // Act
        const result = getUnsupportedObligationSubtypeCodes({
          obligations: [],
          supportedSubtypes: mockSupportedSubtypes,
        });

        // Assert
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('when the provided supportedSubtypes is an empty array', () => {
    it('should return an empty array', () => {
      // Act
      const result = getUnsupportedObligationSubtypeCodes({
        obligations: mockObligations,
        supportedSubtypes: [],
      });

      // Assert
      const expected = [OBLIGATION().subtypeCode, OBLIGATION().subtypeCode];

      expect(result).toStrictEqual(expected);
    });
  });
});

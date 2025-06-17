import { GIFT } from '@ukef/constants';
import { GIFT_EXAMPLES } from '@ukef/constants/examples/gift.examples.constant';

import { GiftObligationDto } from '../../dto';
import { hasValidFormat, hasValidObligationSubtypeCodeFormats } from '.';

const {
  VALIDATION: {
    COUNTERPARTY: {
      ROLE_ID: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

describe('modules/gift/helpers/is-valid-obligation-subtype-code-format', () => {
  describe('hasValidFormat', () => {
    describe('when an obligation is not provided', () => {
      it('should return false', () => {
        // Act
        const result = hasValidFormat();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when an obligation has an empty subtypeCode is provided', () => {
      it('should return false', () => {
        // Arrange
        const mockObligation: GiftObligationDto = {
          ...GIFT_EXAMPLES.OBLIGATION(),
          subtypeCode: '',
        };

        // Act
        const result = hasValidFormat(mockObligation);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe(`when an obligation has a subtypeCode that is less than ${MIN_LENGTH}`, () => {
      it('should return false', () => {
        // Arrange
        const mockObligation: GiftObligationDto = {
          ...GIFT_EXAMPLES.OBLIGATION(),
          subtypeCode: 'a'.repeat(MIN_LENGTH - 1),
        };

        // Act
        const result = hasValidFormat(mockObligation);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe(`when an obligation has a subtypeCode that is greater than ${MAX_LENGTH}`, () => {
      it('should return false', () => {
        // Arrange
        const mockObligation: GiftObligationDto = {
          ...GIFT_EXAMPLES.OBLIGATION(),
          subtypeCode: 'a'.repeat(MAX_LENGTH + 1),
        };

        // Act
        const result = hasValidFormat(mockObligation);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when an obligation has a subtypeCode in the correct format', () => {
      it('should return true', () => {
        // Arrange
        const mockObligation = GIFT_EXAMPLES.OBLIGATION();

        // Act
        const result = hasValidFormat(mockObligation);

        // Assert
        expect(result).toBe(true);
      });
    });
  });

  describe('hasValidObligationSubtypeCodeFormats', () => {
    describe('when obligations are not provided', () => {
      it('should return false', () => {
        // Act
        const result = hasValidObligationSubtypeCodeFormats();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when obligations is an empty array', () => {
      it('should return false', () => {
        // Arrange
        const mockObligations = [];

        // Act
        const result = hasValidObligationSubtypeCodeFormats(mockObligations);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when an obligation contains a subtypeCode in an incorrect format', () => {
      it('should return false', () => {
        // Arrange
        const mockObligations = [{ ...GIFT_EXAMPLES.OBLIGATION(), subtypeCode: null }];

        // Act
        const result = hasValidObligationSubtypeCodeFormats(mockObligations);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when multiple obligations contain a subtypeCode in an incorrect format', () => {
      it('should return false', () => {
        // Arrange
        const mockObligations = [
          { ...GIFT_EXAMPLES.OBLIGATION(), subtypeCode: null },
          { ...GIFT_EXAMPLES.OBLIGATION(), subtypeCode: undefined },
          { ...GIFT_EXAMPLES.OBLIGATION(), subtypeCode: '' },
        ];

        // Act
        const result = hasValidObligationSubtypeCodeFormats(mockObligations);

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when all obligations contain a subtypeCode in the correct format', () => {
      it('should return true', () => {
        // Arrange
        const mockObligations = [GIFT_EXAMPLES.OBLIGATION(), GIFT_EXAMPLES.OBLIGATION(), GIFT_EXAMPLES.OBLIGATION()];

        // Act
        const result = hasValidObligationSubtypeCodeFormats(mockObligations);

        // Assert
        expect(result).toBe(true);
      });
    });
  });
});

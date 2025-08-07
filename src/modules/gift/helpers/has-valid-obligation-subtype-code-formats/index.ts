import { GIFT } from '@ukef/constants';

import { GiftObligationRequestDto } from '../../dto';

const {
  VALIDATION: {
    OBLIGATION: {
      OBLIGATION_SUBTYPE_CODE: { MIN_LENGTH, MAX_LENGTH },
    },
  },
} = GIFT;

/**
 * Check if an obligation's subtype code has a valid format.
 * @param {GiftObligationRequestDto} obligation
 * @returns {boolean}
 */
export const hasValidFormat = (obligation?: GiftObligationRequestDto) => {
  if (obligation?.subtypeCode && typeof obligation.subtypeCode === 'string') {
    const { subtypeCode } = obligation;

    if (subtypeCode?.length >= MIN_LENGTH && subtypeCode?.length <= MAX_LENGTH) {
      return true;
    }
  }

  return false;
};

/**
 * Check if an array of obligations have valid subtype code formats.
 * @param {GiftObligationRequestDto[]} obligations: Array of obligations
 * @returns {boolean}
 */
export const hasValidObligationSubtypeCodeFormats = (obligations?: GiftObligationRequestDto[]): boolean => {
  const invalidFormats = [];

  if (!Array.isArray(obligations) || !obligations.length) {
    return false;
  }

  obligations.forEach((obligation: GiftObligationRequestDto) => {
    if (!hasValidFormat(obligation)) {
      invalidFormats.push(obligation);
    }
  });

  if (invalidFormats.length) {
    return false;
  }

  return true;
};

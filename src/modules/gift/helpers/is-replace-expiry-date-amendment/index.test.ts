import { EXAMPLES, GIFT } from '@ukef/constants';

import { isReplaceExpiryDateAmendment } from '.';

const {
  GIFT: { FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

describe('modules/gift/helpers/is-replace-expiry-date-amendment', () => {
  describe(`when amendmentType is ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    it('should return true', () => {
      // Arrange
      const payload = {
        ...mockPayload,
        amendmentType: AMEND_FACILITY_REPLACE_EXPIRY_DATE,
      };

      // Act
      const result = isReplaceExpiryDateAmendment(payload);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe(`when amendmentType is ${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
    it('should return false', () => {
      // Arrange
      const payload = {
        ...mockPayload,
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
      };

      // Act
      const result = isReplaceExpiryDateAmendment(payload);

      // Assert
      expect(result).toBe(false);
    });
  });
});

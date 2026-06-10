import { EXAMPLES, GIFT } from '@ukef/constants';

import { isDecreaseAmountAmendment } from '.';

const {
  GIFT: { FACILITY_AMENDMENT_REQUEST_PAYLOAD: mockPayload },
} = EXAMPLES;

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT },
} = GIFT;

describe('modules/gift/helpers/is-decrease-amount-amendment', () => {
  describe(`when amendmentType is ${AMEND_FACILITY_DECREASE_AMOUNT}`, () => {
    it('should return true', () => {
      const payload = {
        ...mockPayload,
        amendmentType: AMEND_FACILITY_DECREASE_AMOUNT,
      };

      const result = isDecreaseAmountAmendment(payload);

      expect(result).toBe(true);
    });
  });

  describe(`when amendmentType is ${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
    it('should return false', () => {
      const payload = {
        ...mockPayload,
        amendmentType: AMEND_FACILITY_INCREASE_AMOUNT,
      };

      const result = isDecreaseAmountAmendment(payload);

      expect(result).toBe(false);
    });
  });
});

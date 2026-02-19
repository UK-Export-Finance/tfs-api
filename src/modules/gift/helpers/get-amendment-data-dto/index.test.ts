import { AmendFacilityType, GIFT } from '@ukef/constants';

import { DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto } from '../../dto';
import { getAmendmentDataDto } from '.';

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

describe('modules/gift/helpers/get-amendment-data-dto', () => {
  describe(`when the provided amendmentType is ${AMEND_FACILITY_DECREASE_AMOUNT}`, () => {
    it('should return a response with the received status and data', () => {
      const result = getAmendmentDataDto(AMEND_FACILITY_DECREASE_AMOUNT);

      expect(result).toBe(DecreaseAmountDto);
    });
  });

  describe(`when the provided amendmentType is ${AMEND_FACILITY_INCREASE_AMOUNT}`, () => {
    it('should return a response with the received status and data', () => {
      const result = getAmendmentDataDto(AMEND_FACILITY_INCREASE_AMOUNT);

      expect(result).toBe(IncreaseAmountDto);
    });
  });

  describe(`when the provided amendmentType is ${AMEND_FACILITY_REPLACE_EXPIRY_DATE}`, () => {
    it('should return a response with the received status and data', () => {
      const result = getAmendmentDataDto(AMEND_FACILITY_REPLACE_EXPIRY_DATE);

      expect(result).toBe(ReplaceExpiryDateDto);
    });
  });

  describe('when the provided amendmentType is invalid', () => {
    it('should return null', () => {
      const invalidAmendmentType = 'invalid-amendment-type' as AmendFacilityType;

      const result = getAmendmentDataDto(invalidAmendmentType);

      expect(result).toBeNull();
    });
  });
});

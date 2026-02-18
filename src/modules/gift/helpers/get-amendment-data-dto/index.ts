import { AmendFacilityType, GIFT } from '@ukef/constants';

import { DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto } from '../../dto';

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

type ReturnType = DecreaseAmountDto | IncreaseAmountDto | ReplaceExpiryDateDto;

/**
 * Get an "amendmentData" DTO class constructor corresponding to the provided amendmentType
 * @param {AmendFacilityType} amendmentType: The type of amendment
 * @returns {ReturnType | null} A DTO class instance or null if the amendment type is invalid
 */
export const getAmendmentDataDto = (amendmentType: AmendFacilityType): ReturnType | null => {
  switch (amendmentType) {
    case AMEND_FACILITY_DECREASE_AMOUNT:
      return new DecreaseAmountDto();
    case AMEND_FACILITY_INCREASE_AMOUNT:
      return new IncreaseAmountDto();
    case AMEND_FACILITY_REPLACE_EXPIRY_DATE:
      return new ReplaceExpiryDateDto();
    default:
      return null;
  }
};

import { AmendFacilityType, GIFT } from '@ukef/constants';

import { DecreaseAmountDto, IncreaseAmountDto, ReplaceExpiryDateDto } from '../../dto';

const {
  AMEND_FACILITY_TYPES: { AMEND_FACILITY_DECREASE_AMOUNT, AMEND_FACILITY_INCREASE_AMOUNT, AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

type ReturnType = DecreaseAmountDto | IncreaseAmountDto | ReplaceExpiryDateDto;

/**
 * Get an "amendmentData" DTO class constructor corresponding to the provided amendmentType
 * @param {AmendFacilityType} amendmentType: The type of amendment
 * @returns {new () => ReturnType | null} A DTO class constructor or null if the amendment type is invalid
 */
export const getAmendmentDataDto = (amendmentType: AmendFacilityType): (new () => ReturnType) | null => {
  switch (amendmentType) {
    case AMEND_FACILITY_DECREASE_AMOUNT:
      return DecreaseAmountDto;
    case AMEND_FACILITY_INCREASE_AMOUNT:
      return IncreaseAmountDto;
    case AMEND_FACILITY_REPLACE_EXPIRY_DATE:
      return ReplaceExpiryDateDto;
    default:
      return null;
  }
};

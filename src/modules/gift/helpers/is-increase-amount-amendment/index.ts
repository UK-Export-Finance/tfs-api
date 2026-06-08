import { GIFT } from '@ukef/constants';

import { CreateGiftFacilityAmendmentRequestDto, IncreaseAmountDto } from '../../dto';

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_INCREASE_AMOUNT },
} = GIFT;

export type IncreaseAmountAmendmentRequest = CreateGiftFacilityAmendmentRequestDto & {
  amendmentType: typeof AMEND_FACILITY_INCREASE_AMOUNT;
  amendmentData: IncreaseAmountDto;
};

/**
 * Type guard for increase amount facility amendments.
 * @param {CreateGiftFacilityAmendmentRequestDto} amendment: Facility amendment request.
 * @returns {boolean} True when amendmentType is IncreaseAmount.
 */
export const isIncreaseAmountAmendment = (amendment: CreateGiftFacilityAmendmentRequestDto): amendment is IncreaseAmountAmendmentRequest =>
  amendment.amendmentType === AMEND_FACILITY_INCREASE_AMOUNT;

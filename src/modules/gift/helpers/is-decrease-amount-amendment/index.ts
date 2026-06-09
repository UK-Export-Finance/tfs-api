import { GIFT } from '@ukef/constants';

import { CreateGiftFacilityAmendmentRequestDto, DecreaseAmountDto } from '../../dto';

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_DECREASE_AMOUNT },
} = GIFT;

export type DecreaseAmountAmendmentRequest = CreateGiftFacilityAmendmentRequestDto & {
  amendmentType: typeof AMEND_FACILITY_DECREASE_AMOUNT;
  amendmentData: DecreaseAmountDto;
};

/**
 * Type guard for decrease amount facility amendments.
 * @param {CreateGiftFacilityAmendmentRequestDto} amendment: Facility amendment request.
 * @returns {boolean} True when amendmentType is DecreaseAmount.
 */
export const isDecreaseAmountAmendment = (amendment: CreateGiftFacilityAmendmentRequestDto): amendment is DecreaseAmountAmendmentRequest =>
  amendment.amendmentType === AMEND_FACILITY_DECREASE_AMOUNT;

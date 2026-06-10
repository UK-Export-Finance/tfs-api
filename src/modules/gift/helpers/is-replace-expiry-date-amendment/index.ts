import { GIFT } from '@ukef/constants';

import { CreateGiftFacilityAmendmentRequestDto, ReplaceExpiryDateDto } from '../../dto';

const {
  AMEND_FACILITY_TYPES_CONSUMER: { AMEND_FACILITY_REPLACE_EXPIRY_DATE },
} = GIFT;

export type ReplaceExpiryDateAmendmentRequest = CreateGiftFacilityAmendmentRequestDto & {
  amendmentType: typeof AMEND_FACILITY_REPLACE_EXPIRY_DATE;
  amendmentData: ReplaceExpiryDateDto;
};

/**
 * Type guard for replace expiry date facility amendments.
 * @param {CreateGiftFacilityAmendmentRequestDto} amendment: Facility amendment request.
 * @returns {boolean} True when amendmentType is ReplaceExpiryDate.
 */
export const isReplaceExpiryDateAmendment = (amendment: CreateGiftFacilityAmendmentRequestDto): amendment is ReplaceExpiryDateAmendmentRequest =>
  amendment.amendmentType === AMEND_FACILITY_REPLACE_EXPIRY_DATE;

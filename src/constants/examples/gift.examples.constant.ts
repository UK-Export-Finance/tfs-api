import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityDto } from '@ukef/modules/gift/dto';

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const FACILITY = {
  AVAILABLE_AMOUNT: 3000000,
  CREATED_DATE_TIME: '2025-03-21T09:58:21.115Z',
  CURRENCY: 'USD',
  DEAL_ID,
  DRAWN_AMOUNT: 2000000,
  EFFECTIVE_DATE: '2025-01-01',
  END_OF_COVER_DATE: '2025-03-01',
  EXPIRY_DATE: '2025-02-01',
  FACILITY_AMOUNT: 1000000,
  FACILITY_ID,
  FACILITY_NAME: 'Amazing facility',
  IS_REVOLVING: true,
  IS_DRAFT: false,
  OBLIGOR_URN: '01234567',
  STREAM_ID: '7d915bfa-0069-4aaa-92c5-013925f019a1',
  STREAM_VERSION: 1,
};

const FACILITY_OVERVIEW_DATA = {
  facilityId: FACILITY.FACILITY_ID,
  streamId: FACILITY.STREAM_ID,
  streamVersion: FACILITY.STREAM_VERSION,
  name: FACILITY.FACILITY_NAME,
  obligorUrn: FACILITY.OBLIGOR_URN,
  currency: FACILITY.CURRENCY,
  facilityAmount: FACILITY.FACILITY_AMOUNT,
  // drawnAmount: FACILITY.DRAWN_AMOUNT,
  // availableAmount: FACILITY.AVAILABLE_AMOUNT,
  effectiveDate: FACILITY.EFFECTIVE_DATE,
  expiryDate: FACILITY.EXPIRY_DATE,
  endOfCoverDate: FACILITY.END_OF_COVER_DATE,
  dealId: FACILITY.DEAL_ID,
  isRevolving: FACILITY.IS_REVOLVING,
  isDraft: FACILITY.IS_DRAFT,
  createdDatetime: FACILITY.CREATED_DATE_TIME,
  productType: 'MOCK',
};

/**
 * FACILITY_CREATION_PAYLOAD
 * Facility creation data in the shape that APIM TFS requires.
 */
const FACILITY_CREATION_PAYLOAD: GiftFacilityCreationDto = {
  overview: FACILITY_OVERVIEW_DATA,

  /**
   * NOTE: the below properties are purely for example purposes.
   * These will be populated in upcoming PRs.
   */
  counterParties: [],
  fees: [],
  obligations: [],
  repaymentProfiles: [],
};

/**
 * FACILITY_RESPONSE_DATA
 * Facility data in the shape that GIFT returns.
 */
const FACILITY_RESPONSE_DATA: GiftFacilityDto = {
  facilityId: FACILITY.FACILITY_ID,
  ...FACILITY_OVERVIEW_DATA,
};

export const GIFT_EXAMPLES = {
  FACILITY,
  FACILITY_CREATION_PAYLOAD,
  FACILITY_ID,
  FACILITY_RESPONSE_DATA,
};

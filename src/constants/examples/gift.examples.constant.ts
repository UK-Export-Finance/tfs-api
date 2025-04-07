import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityResponseDto } from '@ukef/modules/gift/dto';

import { CURRENCIES } from '../currencies.constant';

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const WORK_PACKAGE_ID = 123;

const COUNTERPARTY = {
  COUNTERPARTY_URN: '01234567',
  EXIT_DATE: '2025-08-10',
  ROLE_ID: 'buyer',
  SHARE_PERCENTAGE: 25,
  START_DATE: '2025-04-10',
};

const COUNTERPARTY_DATA = {
  counterpartyUrn: COUNTERPARTY.COUNTERPARTY_URN,
  exitDate: COUNTERPARTY.EXIT_DATE,
  roleId: COUNTERPARTY.ROLE_ID,
  sharePercentage: COUNTERPARTY.SHARE_PERCENTAGE,
  startDate: COUNTERPARTY.START_DATE,
};

const FACILITY = {
  AVAILABLE_AMOUNT: 3000000,
  CREATED_DATE_TIME: '2025-03-21T09:58:21.115Z',
  CURRENCY: CURRENCIES.USD,
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
  WORK_PACKAGE_ID,
};

const FACILITY_OVERVIEW_DATA = {
  facilityId: FACILITY.FACILITY_ID,
  streamId: FACILITY.STREAM_ID,
  streamVersion: FACILITY.STREAM_VERSION,
  name: FACILITY.FACILITY_NAME,
  obligorUrn: FACILITY.OBLIGOR_URN,
  currency: FACILITY.CURRENCY,
  facilityAmount: FACILITY.FACILITY_AMOUNT,
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
  counterparties: [COUNTERPARTY_DATA, COUNTERPARTY_DATA],

  /**
   * NOTE: the below properties are purely for example purposes.
   * These will be populated in upcoming PRs.
   */
  fees: [],
  obligations: [],
  repaymentProfiles: [],
};

/**
 * FACILITY_RESPONSE_DATA
 * Facility data in the shape that GIFT returns.
 */
const FACILITY_RESPONSE_DATA: GiftFacilityResponseDto = {
  facilityId: FACILITY.FACILITY_ID,
  ...FACILITY_OVERVIEW_DATA,
  drawnAmount: FACILITY.DRAWN_AMOUNT,
  availableAmount: FACILITY.AVAILABLE_AMOUNT,
  workPackageId: FACILITY.WORK_PACKAGE_ID,
};

export const GIFT_EXAMPLES = {
  COUNTERPARTY,
  COUNTERPARTY_DATA,
  DEAL_ID,
  FACILITY,
  FACILITY_CREATION_PAYLOAD,
  FACILITY_ID,
  FACILITY_OVERVIEW_DATA,
  FACILITY_RESPONSE_DATA,
  WORK_PACKAGE_ID,
};

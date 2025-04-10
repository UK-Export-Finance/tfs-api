import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityPostResponseDto } from '@ukef/modules/gift/dto';
import { Chance } from 'chance';

import { CURRENCIES } from '../currencies.constant';
import { GIFT } from '../gift.constant';

const { VALIDATION } = GIFT;

const chance = new Chance();

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const WORK_PACKAGE_ID = 123;

const COUNTERPARTY = () => ({
  counterpartyUrn: chance.string({
    length: VALIDATION.COUNTERPARTY.COUNTERPARTY_URN.MAX_LENGTH,
    numeric: true,
  }),
  exitDate: '2025-08-10',
  roleId: 'buyer',
  sharePercentage: 25,
  startDate: '2025-04-10',
});

const REPAYMENT_PROFILE_ALLOCATION = {
  amount: 150000,
  dueDate: '2025-01-02',
};

const REPAYMENT_PROFILE = {
  name: 'Mock repayment profile',
  allocations: [REPAYMENT_PROFILE_ALLOCATION, REPAYMENT_PROFILE_ALLOCATION],
};

const FACILITY_OVERVIEW = {
  facilityId: FACILITY_ID,
  streamId: '7d915bfa-0069-4aaa-92c5-013925f019a1',
  streamVersion: 1,
  name: 'Amazing facility',
  obligorUrn: '01234567',
  currency: CURRENCIES.USD,
  facilityAmount: 1000000,
  effectiveDate: '2025-01-01',
  expiryDate: '2025-02-01',
  endOfCoverDate: '2025-03-01',
  dealId: DEAL_ID,
  isRevolving: true,
  isDraft: true,
  createdDatetime: '2025-03-21T09:58:21.115Z',
  productType: 'Mock product type',
};

/**
 * FACILITY_CREATION_PAYLOAD
 * Facility creation data in the shape that APIM TFS requires.
 */
const FACILITY_CREATION_PAYLOAD: GiftFacilityCreationDto = {
  overview: FACILITY_OVERVIEW,
  counterparties: [COUNTERPARTY(), COUNTERPARTY()],
  repaymentProfiles: [REPAYMENT_PROFILE, REPAYMENT_PROFILE],

  /**
   * NOTE: the below properties are purely for example purposes.
   * These will be populated in upcoming PRs.
   */
  fees: [],
  obligations: [],
};

/**
 * FACILITY_RESPONSE_DATA
 * Facility data in the shape that GIFT returns.
 */
const FACILITY_RESPONSE_DATA: GiftFacilityPostResponseDto = {
  ...FACILITY_OVERVIEW,
  drawnAmount: 2000000,
  availableAmount: 3000000,
  workPackageId: WORK_PACKAGE_ID,
};

export const GIFT_EXAMPLES = {
  COUNTERPARTY,
  DEAL_ID,
  FACILITY_CREATION_PAYLOAD,
  FACILITY_ID,
  FACILITY_OVERVIEW,
  FACILITY_RESPONSE_DATA,
  REPAYMENT_PROFILE,
  REPAYMENT_PROFILE_ALLOCATION,
  WORK_PACKAGE_ID,
};

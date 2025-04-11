import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityPostResponseDto } from '@ukef/modules/gift/dto';
import { Chance } from 'chance';

import { CURRENCIES } from '../currencies.constant';
import { GIFT } from '../gift.constant';

const { VALIDATION } = GIFT;

const chance = new Chance();

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const FACILITY_AMOUNT = 1000000;

const WORK_PACKAGE_ID = 123;

/**
 * Example counterparty.
 * NOTE: Each counterparty URN is unique.
 */
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

/**
 * Repayment profile allocation example.
 * NOTE: The total of all amounts should not be greater than the facility amount.
 * NOTE: Each due date is unique.
 */
const REPAYMENT_PROFILE_ALLOCATION = (index: number = 0) => {
  const today = new Date();

  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear() + index;

  const dueDate = `${day}-${month}-${year}`;

  return {
    amount: FACILITY_AMOUNT / 4,
    dueDate,
  };
};

const REPAYMENT_PROFILE = () => ({
  name: chance.string(),
  allocations: [REPAYMENT_PROFILE_ALLOCATION(0), REPAYMENT_PROFILE_ALLOCATION(1)],
});

const FACILITY_OVERVIEW = {
  facilityId: FACILITY_ID,
  streamId: '7d915bfa-0069-4aaa-92c5-013925f019a1',
  streamVersion: 1,
  name: 'Amazing facility',
  obligorUrn: '01234567',
  currency: CURRENCIES.USD,
  facilityAmount: FACILITY_AMOUNT,
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
  repaymentProfiles: [REPAYMENT_PROFILE(), REPAYMENT_PROFILE()],

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

import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityPostResponseDto } from '@ukef/modules/gift/dto';
import { Chance } from 'chance';

import { CURRENCIES } from '../currencies.constant';
import { GIFT } from '../gift/gift.constant';

const { VALIDATION } = GIFT;

const chance = new Chance();

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

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

const FIXED_FEE = () => ({
  feeTypeCode: 'PLA', // TODO: are there specific codes or is any string allowed?
  description: 'Mock fee description',
  dueDate: '2025-09-11',
  currency: CURRENCIES.USD,
  amountDue: 5000,
});

const OBLIGATION = () => ({
  effectiveDate: '2024-03-01',
  maturityDate: '2024-04-01',
  currency: CURRENCIES.USD,
  obligationAmount: 2500,
  productSubtype: 'Mock product subtype',
});

/**
 * Repayment profile allocation example.
 * NOTE: The total of all amounts should not be greater than the facility amount.
 * NOTE: Each due date is unique.
 */
const REPAYMENT_PROFILE_ALLOCATION = (index: number = 0) => {
  const today = new Date();

  const day = '01';
  const month = '02';
  const year = today.getFullYear() + index;

  const dueDate = `${day}-${month}-${year}`;

  return {
    amount: 5000,
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
  facilityAmount: 10000,
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
  obligations: [OBLIGATION(), OBLIGATION()],
  repaymentProfiles: [
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(0), REPAYMENT_PROFILE_ALLOCATION(1)] },
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(2), REPAYMENT_PROFILE_ALLOCATION(3)] },
  ],

  /**
   * NOTE: the below properties are purely for example purposes.
   * These will be populated in upcoming PRs.
   */
  fees: [],
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
  FIXED_FEE,
  OBLIGATION,
  REPAYMENT_PROFILE,
  REPAYMENT_PROFILE_ALLOCATION,
  WORK_PACKAGE_ID,
};

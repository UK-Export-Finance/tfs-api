import { UkefId } from '@ukef/helpers';
import { GiftFacilityCreationDto, GiftFacilityPostResponseDto, GiftObligationDto } from '@ukef/modules/gift/dto';
import { Chance } from 'chance';

import { SUPPORTED_CURRENCIES } from '../currencies.constant';
import { GIFT } from '../gift/gift.constant';

const { COUNTERPARTY_ROLE_IDS, FEE_TYPE_CODES, FEE_TYPE_DESCRIPTIONS, OBLIGATION_SUBTYPES, PRODUCT_TYPE_CODES, PRODUCT_TYPE_NAMES, VALIDATION } = GIFT;

const chance = new Chance();

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const WORK_PACKAGE_ID = 123;

/**
 * Example counterparty roles.
 */
const COUNTERPARTY_ROLE = {
  LEAD_ECA: {
    displayText: 'Lead ECA',
    hasShare: false,
    id: COUNTERPARTY_ROLE_IDS.LEAD_ECA,
  },
  GUARANTOR: {
    displayText: 'Guarantor',
    hasShare: true,
    id: COUNTERPARTY_ROLE_IDS.GUARANTOR,
  },
};

/**
 * Example counterparty.
 * NOTE: Each counterparty URN is unique.
 */
const COUNTERPARTY = () => ({
  counterpartyUrn: chance.string({
    length: VALIDATION.COUNTERPARTY.COUNTERPARTY_URN.MAX_LENGTH,
    numeric: true,
  }),
  exitDate: '2025-01-16',
  roleId: COUNTERPARTY_ROLE.GUARANTOR.id,
  sharePercentage: 25,
  startDate: '2025-01-13',
});

/**
 * Example fee types.
 */
const FEE_TYPES_RESPONSE_DATA = {
  feeTypes: [
    {
      code: FEE_TYPE_CODES.BEX,
      description: FEE_TYPE_DESCRIPTIONS.BEX,
    },
    {
      code: FEE_TYPE_CODES.PLA,
      description: FEE_TYPE_DESCRIPTIONS.PLA,
    },
  ],
};

const FIXED_FEE = () => ({
  feeTypeCode: FEE_TYPE_CODES.PLA,
  description: 'Mock fixed fee description',
  effectiveDate: '2025-01-15',
  currency: SUPPORTED_CURRENCIES.USD,
  amountDue: 5000,
});

/**
 * Obligation example
 * @param {String} subtypeCode: Obligation subtype code
 * @returns {GiftObligationDto}
 */
const OBLIGATION = ({ subtypeCode = OBLIGATION_SUBTYPES.EXP01.code } = {}): GiftObligationDto => ({
  effectiveDate: '2025-01-13',
  maturityDate: '2025-01-15',
  currency: SUPPORTED_CURRENCIES.USD,
  amount: 2500,
  subtypeCode,
});

const OBLIGATION_SUBTYPES_RESPONSE_DATA = {
  obligationSubtypes: Object.values(OBLIGATION_SUBTYPES),
};

const PRODUCT_TYPE_RESPONSE_DATA = {
  code: PRODUCT_TYPE_CODES.EXIP,
  name: PRODUCT_TYPE_NAMES.EXIP,
};

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

  const dueDate = `${year}-${month}-${day}`;

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
  currency: SUPPORTED_CURRENCIES.USD,
  facilityAmount: 10000,
  effectiveDate: '2025-01-01',
  expiryDate: '2027-02-01',
  dealId: DEAL_ID,
  isRevolving: true,
  isDraft: true,
  createdDatetime: '2025-01-21T09:58:21.115Z',
  productTypeCode: PRODUCT_TYPE_CODES.EXIP,
};

/**
 * FACILITY_CREATION_PAYLOAD
 * Facility creation data in the shape that APIM TFS requires.
 */
const FACILITY_CREATION_PAYLOAD: GiftFacilityCreationDto = {
  overview: FACILITY_OVERVIEW,
  counterparties: [COUNTERPARTY(), COUNTERPARTY()],
  fixedFees: [FIXED_FEE(), FIXED_FEE()],
  obligations: [OBLIGATION(), OBLIGATION()],
  repaymentProfiles: [
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(0), REPAYMENT_PROFILE_ALLOCATION(1)] },
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(2), REPAYMENT_PROFILE_ALLOCATION(3)] },
  ],
};

/**
 * FACILITY_RESPONSE_DATA
 * Facility data in the shape that GIFT returns.
 */
const FACILITY_RESPONSE_DATA: GiftFacilityPostResponseDto = {
  configurationEvent: {
    data: {
      ...FACILITY_OVERVIEW,
      drawnAmount: 2000000,
      availableAmount: 3000000,
    },
  },
  workPackageId: WORK_PACKAGE_ID,
};

const STATES = {
  APPROVED: 'APPROVED',
};

/**
 * WORK_PACKAGE_APPROVE_RESPONSE_DATA
 * "Work package approve" data in the shape that GIFT returns.
 */
const WORK_PACKAGE_APPROVE_RESPONSE_DATA = {
  id: WORK_PACKAGE_ID,
  name: FACILITY_OVERVIEW.name,
  isFacilityCreation: true,
  createdDatetime: '2025-05-13T09:59:01.896Z',
  currency: SUPPORTED_CURRENCIES.USD,
  streamId: '4b9c09c9-9e63-4ebb-9ed9-a5905d24c9d0',
  state: STATES.APPROVED,
  configurationEvents: [],
  users: [],
};

export const GIFT_EXAMPLES = {
  COUNTERPARTY,
  COUNTERPARTY_ROLE,
  CURRENCIES: Object.values(SUPPORTED_CURRENCIES),
  DEAL_ID,
  FACILITY_CREATION_PAYLOAD,
  FACILITY_ID,
  FACILITY_OVERVIEW,
  FACILITY_RESPONSE_DATA,
  FEE_TYPES_RESPONSE_DATA,
  FIXED_FEE,
  OBLIGATION,
  OBLIGATION_SUBTYPES_RESPONSE_DATA,
  PRODUCT_TYPE_RESPONSE_DATA,
  REPAYMENT_PROFILE,
  REPAYMENT_PROFILE_ALLOCATION,
  STATES,
  WORK_PACKAGE_APPROVE_RESPONSE_DATA,
  WORK_PACKAGE_ID,
};

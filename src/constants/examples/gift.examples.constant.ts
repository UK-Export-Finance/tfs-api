import { UkefId } from '@ukef/helpers';
import {
  GiftFacilityCounterpartyRequestDto,
  GiftFacilityCreationRequestDto,
  GiftFacilityPostResponseDto,
  GiftObligationRequestDto,
} from '@ukef/modules/gift/dto';
import { Chance } from 'chance';

import { SUPPORTED_CURRENCIES } from '../currencies.constant';
import { CONSUMER } from '../gift/consumer.constant';
import { AMEND_FACILITY_TYPES, GIFT } from '../gift/gift.constant';

const {
  COUNTERPARTY_ROLE_CODES,
  CREDIT_TYPES,
  EVENT_TYPES,
  FEE_TYPE_CODES,
  FEE_TYPE_DESCRIPTIONS,
  INTEGRATION_DEFAULTS,
  OBLIGATION_SUBTYPES,
  FACILITY_CATEGORIES,
  PRODUCT_TYPE_CODES,
  PRODUCT_TYPE_NAMES,
  VALIDATION,
} = GIFT;

const chance = new Chance();

const DEAL_ID: UkefId = '0030000123';
const FACILITY_ID: UkefId = '0030000321';

const WORK_PACKAGE_ID = 123;

const BUSINESS_CALENDAR = {
  centreCode: 'GB_LON',
  startDate: '2025-01-01',
  exitDate: '2027-02-01',
};

const BUSINESS_CALENDARS_CONVENTION = {
  businessDayConvention: INTEGRATION_DEFAULTS.BUSINESS_CALENDARS_CONVENTION,
  dueOnLastWorkingDayEachMonth: INTEGRATION_DEFAULTS.DUE_ON_LAST_WORKING_DAY_EACH_MONTH,
  dateSnapBack: INTEGRATION_DEFAULTS.DATE_SNAP_BACK,
};

/**
 * Example counterparty roles.
 */
const COUNTERPARTY_ROLE = {
  EXPORTER: {
    name: 'Exporter',
    hasSharePercentage: false,
    code: COUNTERPARTY_ROLE_CODES.EXPORTER,
  },
  GUARANTOR: {
    name: 'Guarantor',
    hasSharePercentage: true,
    code: COUNTERPARTY_ROLE_CODES.GUARANTOR,
  },
};

const COUNTERPARTY_ROLES_RESPONSE_DATA = {
  counterpartyRoles: [COUNTERPARTY_ROLE.EXPORTER],
};

/**
 * Example counterparty.
 * NOTE:
 * - Each counterparty URN is unique.
 * - Counterparty sharePercentage is only required if a counterparty role has hasSharePercentage=true
 * @param {boolean} withSharePercentage: Whether to return a sharePercentage field and alterantive roleCode
 */
const COUNTERPARTY = ({ withSharePercentage = false } = {}): GiftFacilityCounterpartyRequestDto => {
  const counterparty: GiftFacilityCounterpartyRequestDto = {
    counterpartyUrn: chance.string({
      length: VALIDATION.COUNTERPARTY.COUNTERPARTY_URN.MAX_LENGTH,
      numeric: true,
    }),
    exitDate: '2025-01-16',
    roleCode: COUNTERPARTY_ROLE.EXPORTER.code,
    startDate: '2025-01-13',
  };

  if (withSharePercentage) {
    counterparty.roleCode = COUNTERPARTY_ROLE.GUARANTOR.code;
    counterparty.sharePercentage = 50;
  }

  return counterparty;
};

const CREDIT_RISK_RATINGS = {
  A: 'A',
  AA: 'AA',
  B: 'B',
  BBB: 'BBB',
  C: 'C',
  CC: 'CC',
};

/**
 * Example fee types.
 */
const FEE_TYPES = {
  BEX: {
    code: FEE_TYPE_CODES.BEX,
    description: FEE_TYPE_DESCRIPTIONS.BEX,
  },
  PLA: {
    code: FEE_TYPE_CODES.PLA,
    description: FEE_TYPE_DESCRIPTIONS.PLA,
  },
};

const FEE_TYPES_RESPONSE_DATA = {
  feeTypes: [FEE_TYPES.BEX, FEE_TYPES.PLA],
};

const FIXED_FEE = () => ({
  feeTypeCode: FEE_TYPE_CODES.PLA,
  effectiveDate: '2025-01-15',
  currency: SUPPORTED_CURRENCIES.USD,
  amount: 5000,
});

/**
 * Obligation example
 * @param {string} subtypeCode: Obligation subtype code
 * @returns {GiftObligationRequestDto}
 */
const OBLIGATION = ({ subtypeCode = OBLIGATION_SUBTYPES.BIP02.code } = {}): GiftObligationRequestDto => ({
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

const RISK_DETAILS = {
  facilityCategoryCode: FACILITY_CATEGORIES.BOND_STAND_ALONE,
  dealId: DEAL_ID,
  account: INTEGRATION_DEFAULTS.ACCOUNT,
  facilityCreditRating: CREDIT_RISK_RATINGS.AA,
  riskStatus: INTEGRATION_DEFAULTS.RISK_STATUS,
  ukefIndustryCode: '0101',
};

const FACILITY_OVERVIEW = {
  facilityId: FACILITY_ID,
  name: 'Amazing facility',
  obligorUrn: '01234567',
  currency: SUPPORTED_CURRENCIES.USD,
  amount: 10000,
  effectiveDate: '2025-01-01',
  expiryDate: '2027-02-01',
  creditType: CREDIT_TYPES.REVOLVER,
  productTypeCode: PRODUCT_TYPE_CODES.BIP,
};

/**
 * FACILITY_CREATION_PAYLOAD
 * Facility creation data in the shape that APIM TFS requires.
 */
const FACILITY_CREATION_PAYLOAD: GiftFacilityCreationRequestDto = {
  consumer: CONSUMER.DTFS,
  overview: FACILITY_OVERVIEW,
  counterparties: [COUNTERPARTY(), COUNTERPARTY()],
  fixedFees: [FIXED_FEE(), FIXED_FEE()],
  obligations: [OBLIGATION(), OBLIGATION()],
  repaymentProfiles: [
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(0), REPAYMENT_PROFILE_ALLOCATION(1)] },
    { ...REPAYMENT_PROFILE(), allocations: [REPAYMENT_PROFILE_ALLOCATION(2), REPAYMENT_PROFILE_ALLOCATION(3)] },
  ],
  riskDetails: RISK_DETAILS,
};

const FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA = {
  INCREASE_AMOUNT: {
    amount: 150,
    date: '2027-01-30',
  },
  DECREASE_AMOUNT: {
    amount: 100,
    date: '2027-02-15',
  },
  REPLACE_EXPIRY_DATE: {
    expiryDate: '2030-03-20',
  },
};

const FACILITY_AMENDMENT_REQUEST_PAYLOAD = {
  amendmentType: AMEND_FACILITY_TYPES.AMEND_FACILITY_INCREASE_AMOUNT,
  amendmentData: FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
};

/**
 * FACILITY_RESPONSE_DATA
 * Facility data in the shape that GIFT returns.
 */
const FACILITY_RESPONSE_DATA: GiftFacilityPostResponseDto = {
  configurationEvent: {
    data: {
      ...FACILITY_OVERVIEW,
      streamId: '7d915bfa-0069-4aaa-92c5-013925f019a1',
      streamVersion: 1,
      isDraft: true,
      createdDatetime: '2025-01-21T09:58:21.115Z',
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
 * WORK_PACKAGE_CREATION_RESPONSE_DATA
 * "Work package creation" data in the shape that GIFT returns.
 * NOTE:
 * - The "type" field could be any string - any GIFT configuration event name.
 * - The "data" field could be any object - depending on the GIFT configuration event data.
 */
const WORK_PACKAGE_CREATION_RESPONSE_DATA = {
  id: WORK_PACKAGE_ID,
  type: EVENT_TYPES.AMEND_FACILITY_INCREASE_AMOUNT,
  data: FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA.INCREASE_AMOUNT,
  isApproved: false,
  createdByUserId: 'API-USER - APIM TFS - DTFS',
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
  BUSINESS_CALENDAR,
  BUSINESS_CALENDARS_CONVENTION,
  COUNTERPARTY,
  COUNTERPARTY_ROLE,
  COUNTERPARTY_ROLES_RESPONSE_DATA,
  CREDIT_RISK_RATINGS,
  CURRENCIES: Object.values(SUPPORTED_CURRENCIES),
  DEAL_ID,
  FACILITY_CREATION_PAYLOAD,
  FACILITY_AMENDMENT_REQUEST_PAYLOAD,
  FACILITY_AMENDMENT_REQUEST_PAYLOAD_DATA,
  FACILITY_ID,
  FACILITY_OVERVIEW,
  FACILITY_RESPONSE_DATA,
  FEE_TYPES,
  FEE_TYPES_RESPONSE_DATA,
  FIXED_FEE,
  OBLIGATION,
  OBLIGATION_SUBTYPES_RESPONSE_DATA,
  PRODUCT_TYPE_RESPONSE_DATA,
  REPAYMENT_PROFILE,
  REPAYMENT_PROFILE_ALLOCATION,
  RISK_DETAILS,
  STATES,
  WORK_PACKAGE_CREATION_RESPONSE_DATA,
  WORK_PACKAGE_APPROVE_RESPONSE_DATA,
  WORK_PACKAGE_ID,
};

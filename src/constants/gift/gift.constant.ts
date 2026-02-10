import { CONSUMER } from './consumer.constant';
import { VALIDATION } from './validation.constant';

export const GIFT = {
  API_RESPONSE_MESSAGES: {
    ASYNC_FACILITY_VALIDATION_ERRORS: 'Async validation errors with facility entity(s)',
    GIFT_FACILITY_VALIDATION_ERRORS: 'GIFT validation errors with facility entity(s)',
    APPROVED_STATUS_ERROR_MESSAGE: 'Error updating GIFT work package status to approved',
  },
  API_RESPONSE_TYPES: {
    ERROR: 'api-error-response',
  },
  COUNTERPARTY_ROLE_CODES: {
    EXPORTER: 'CRT001',
    GUARANTOR: 'CRT013',
  },
  CREDIT_TYPES: {
    REVOLVER: 'Revolver',
    TERM: 'Term',
  },
  INTEGRATION_DEFAULTS: {
    ACCOUNT: '1',
    BUSINESS_CALENDARS_CONVENTION: 'MODIFIED_FOLLOWING',
    DATE_SNAP_BACK: false,
    DUE_ON_LAST_WORKING_DAY_EACH_MONTH: false,
    RISK_STATUS: 'Corporate',
    OVERRIDE_RISK_RATING: null,
    OVERRIDE_LOSS_GIVEN_DEFAULT: null,
    RISK_REASSESSMENT_DATE: null,
  },
  ENTITY_NAMES: {
    BUSINESS_CALENDAR: 'Business calendar',
    BUSINESS_CALENDARS_CONVENTION: 'Business calendars convention',
    COUNTERPARTY: 'Counterparty',
    FIXED_FEE: 'Fixed fee',
    OBLIGATION: 'Obligation',
    REPAYMENT_PROFILE: 'Repayment profile',
    RISK_DETAILS: 'Risk details',
  },
  EVENT_TYPES: {
    ADD_BUSINESS_CALENDAR: 'AddFacilityBusinessCalendar',
    ADD_BUSINESS_CALENDARS_CONVENTION: 'AddFacilityBusinessCalendarsConvention',
    ADD_COUNTERPARTY: 'AddFacilityCounterparty',
    ADD_REPAYMENT_PROFILE: 'AddRepaymentProfile',
    CREATE_FACILITY: 'CreateFacility',
    ADD_FIXED_FEE: 'AddFixedFee',
    ADD_OBLIGATION: 'AddObligation',
    ADD_RISK_DETAILS: 'AddRiskDetails',
    AMEND_FACILITY_INCREASE_AMOUNT: 'AmendFacility_IncreaseAmount',
    AMEND_FACILITY_DECREASE_AMOUNT: 'AmendFacility_DecreaseAmount',
    AMEND_FACILITY_REPLACE_EXPIRY_DATE: 'AmendFacility_ReplaceExpiryDate',
  },
  FEE_TYPE_CODES: {
    BEX: 'BEX',
    CMF: 'CMF',
    PLA: 'PLA',
  },
  FEE_TYPE_DESCRIPTIONS: {
    BEX: 'BROKERAGE EXPENSE',
    CMF: 'COMMITMENT FEES',
    PLA: 'PREMIUM LESS ADMIN',
  },
  OBLIGATION_SUBTYPES: {
    BIP02: {
      code: 'OST001',
      productTypeCode: 'PRT001',
      name: 'Advanced Payment Bond',
    },
    EXP01: {
      code: 'OST009',
      productTypeCode: 'PRT002',
      name: 'EXIP Cash',
    },
    EXP02: {
      code: 'OST010',
      productTypeCode: 'PRT002',
      name: 'Consecutive',
    },
  },
  PATH: {
    APPROVE: '/approve',
    COUNTERPARTY_ROLES: '/counterparty-role',
    CURRENCY: '/currency',
    CONFIGURATION_EVENT: '/configuration-event/type',
    CREATE_FACILITY: '/work-package/create-facility',
    FACILITY: '/facility',
    FEE_TYPE: '/fee-type',
    OBLIGATION_SUBTYPE: '/obligation-subtype',
    PRODUCT_TYPE: '/product-type',
    SUPPORTED: '/supported',
    WORK_PACKAGE: '/work-package',
  },
  FACILITY_CATEGORIES: {
    BOND_STAND_ALONE: 'BOND: STAND ALONE',
    BOND_SUPPLEMENTAL_TO_CASH: 'BOND: SUPPLEMENTAL TO CASH',
    BOND_SUPPLEMENTAL_TO_CREDIT: 'BOND: SUPPLEMENTAL TO CREDIT',
  },
  PRODUCT_TYPE_CODES: {
    BIP: 'PRT001',
    EXIP: 'PRT002',
  },
  PRODUCT_TYPE_NAMES: {
    BIP: 'Bond Insurance Policy (BIP)',
    EXIP: 'Export Insurance Policy (EXIP)',
  },
  CONSUMER,
  VALIDATION,
};

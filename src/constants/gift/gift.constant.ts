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
    EXPORTER: 'CRP001',
    GUARANTOR: 'CRP013',
  },
  ENTITY_NAMES: {
    COUNTERPARTY: 'Counterparty',
    FIXED_FEE: 'Fixed fee',
    OBLIGATION: 'Obligation',
    REPAYMENT_PROFILE: 'Repayment profile',
  },
  EVENT_TYPES: {
    ADD_COUNTERPARTY: 'AddFacilityCounterparty',
    ADD_MANUAL_REPAYMENT_PROFILE: 'AddManualRepaymentProfile',
    CREATE_FACILITY: 'CreateFacility',
    ADD_FIXED_FEE: 'AddFixedFee',
    ADD_OBLIGATION: 'AddObligation',
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
      code: 'BIP02',
      productTypeCode: 'BIP',
      name: 'Advanced Payment Bond',
    },
    EXP01: {
      code: 'EXP01',
      productTypeCode: 'EXIP',
      name: 'EXIP Cash',
    },
    EXP02: {
      code: 'EXP02',
      productTypeCode: 'EXIP',
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
  PRODUCT_TYPE_CODES: {
    BIP: 'BIP',
    EXIP: 'EXIP',
  },
  PRODUCT_TYPE_NAMES: {
    BIP: 'Bond Insurance Policy (BIP)',
    EXIP: 'Export Insurance Policy (EXIP)',
  },
  CONSUMER,
  VALIDATION,
};

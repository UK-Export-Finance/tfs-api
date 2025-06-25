import { CONSUMER } from './consumer.constant';
import { VALIDATION } from './validation.constant';

export const GIFT = {
  API_RESPONSE_MESSAGES: {
    FACILITY_VALIDATION_ERRORS: 'Validation errors with facility entity(s)',
    APPROVED_STATUS_ERROR_MESSAGE: 'Error updating GIFT work package status to approved',
  },
  API_RESPONSE_TYPES: {
    ERROR: 'api-error-response',
  },
  COUNTERPARTY_ROLE_CODES: {
    LEAD_ECA: 'lead-eca',
    GUARANTOR: 'guarantor',
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
    CREATE_FIXED_FEE: 'CreateFixedFee',
    CREATE_OBLIGATION: 'CreateObligation',
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
  OBLIGATION_SUBTYPE_CODES: {
    EXP01: 'EXP01',
    EXP02: 'EXP02',
  },
  PATH: {
    APPROVE: '/approve',
    COUNTERPARTY_ROLES: '/facility-counterparty/roles',
    CURRENCY: '/currency',
    CONFIGURATION_EVENT: '/configuration-event/type',
    CREATE_FACILITY: '/work-package/create-facility',
    FACILITY: '/facility',
    FEE_TYPE: '/fee-type',
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

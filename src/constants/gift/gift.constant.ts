import { VALIDATION } from './validation.constant';

export const GIFT = {
  API_RESPONSE_MESSAGES: {
    FACILITY_VALIDATION_ERRORS: 'Validation errors with facility entity(s)',
    APPROVED_STATUS_ERROR_MESSAGE: 'Error updating GIFT work package status to approved',
  },
  API_RESPONSE_TYPES: {
    ERROR: 'api-error-response',
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
  PATH: {
    APPROVE: '/approve',
    CURRENCY: '/currency',
    CONFIGURATION_EVENT: '/configuration-event/type',
    CREATE_FACILITY: '/work-package/create-facility',
    FACILITY: '/facility',
    FEE_TYPE: '/fee-type',
    SUPPORTED: '/supported',
    WORK_PACKAGE: '/work-package',
  },
  PRODUCT_TYPE_CODES: {
    BIP: 'BIP',
    EXIP: 'EXIP',
  },
  VALIDATION,
};

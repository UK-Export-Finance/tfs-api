import { VALIDATION } from './validation.constant';

export const GIFT = {
  API_RESPONSE_MESSAGES: {
    FACILITY_VALIDATION_ERRORS: 'Validation errors with facility entity(s)',
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
    ADD_COUNTERPARTY: 'AddCounterparty',
    ADD_MANUAL_REPAYMENT_PROFILE: 'AddManualRepaymentProfile',
    CREATE_FACILITY: 'CreateFacility',
    CREATE_FIXED_FEE: 'CreateFixedFee',
    CREATE_OBLIGATION: 'CreateObligation',
  },
  FIXED_FEE: {
    FEE_TYPE_CODES: {
      BEX: 'BEX',
      PLA: 'PLA',
    },
  },
  PATH: {
    FACILITY: '/facility',
    CONFIGURATION_EVENT: '/configuration-event',
    CREATE_FACILITY: '/work-package/create-facility',
    WORK_PACKAGE: '/work-package',
  },
  PRODUCT_TYPE_CODES: {
    BIP: 'BIP',
    EXIP: 'EXIP',
  },
  VALIDATION,
};

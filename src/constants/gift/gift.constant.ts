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
  PATH: {
    FACILITY: '/facility',
    COUNTERPARTY: '/counterparty',
    CREATION_EVENT: '/creation-event',
    FIXED_FEE: '/fixed-fee',
    MANUAL: '/manual',
    OBLIGATION: '/obligation',
    REPAYMENT_PROFILE: '/repayment-profile',
    WORK_PACKAGE: '/work-package',
  },
  VALIDATION,
};

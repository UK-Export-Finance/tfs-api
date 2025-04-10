import { UKEFID } from './ukef-id.constant';

/**
 * Date string validation
 * E.g: 2025-01-02
 */
const DATE_STRING_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 10,
};

export const GIFT = {
  API_RESPONSE_MESSAGES: {
    FACILITY_VALIDATION_ERRORS: 'Validation errors with facility entity(s)',
  },
  API_RESPONSE_TYPES: {
    ERROR: 'api-error-response',
  },
  ENTITY_NAMES: {
    COUNTERPARTY: 'Counterparty',
    REPAYMENT_PROFILE: 'Repayment profile',
  },
  PATH: {
    FACILITY: '/facility',
    COUNTERPARTY: '/counterparty',
    CREATION_EVENT: '/creation-event',
    MANUAL: '/manual',
    REPAYMENT_PROFILE: '/repayment-profile',
    WORK_PACKAGE: '/work-package',
  },
  VALIDATION: {
    FACILITY: {
      OVERVIEW: {
        CURRENCY: { MIN_LENGTH: 3, MAX_LENGTH: 3 },
        DEAL_ID: UKEFID.VALIDATION,
        EFFECTIVE_DATE: DATE_STRING_VALIDATION,
        END_OF_COVER_DATE: DATE_STRING_VALIDATION,
        EXPIRY_DATE: DATE_STRING_VALIDATION,
        FACILITY_AMOUNT: { MIN: 1 },
        FACILITY_ID: UKEFID.VALIDATION,
        FACILITY_NAME: { MIN_LENGTH: 1, MAX_LENGTH: 35 },
        OBLIGOR_URN: { MIN_LENGTH: 8, MAX_LENGTH: 8 },
        PRODUCT_TYPE: { MIN_LENGTH: 3, MAX_LENGTH: 30 },
      },
    },
    COUNTERPARTY: {
      COUNTERPARTY_URN: { MIN_LENGTH: 8, MAX_LENGTH: 8 },
      EXIT_DATE: DATE_STRING_VALIDATION,
      ROLE_ID: { MIN_LENGTH: 1, MAX_LENGTH: 50 },
      SHARE_PERCENTAGE: { MIN: 0.1, MAX: 100 },
      START_DATE: DATE_STRING_VALIDATION,
    },
    REPAYMENT_PROFILE: {
      NAME: { MIN_LENGTH: 0, MAX_LENGTH: 120 },
      ALLOCATION: {
        DUE_DATE: DATE_STRING_VALIDATION,
        // TODO: does amount have a maximum?
        AMOUNT: { MIN: 0 },
      },
    },
  },
};

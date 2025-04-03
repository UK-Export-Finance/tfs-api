import { UKEFID } from './ukef-id.constant';
/**
 * Date string validation
 * E.g: 2025-01-02
 */
const DATE_STRING_VALIDATION = {
  MIN: 10,
  MAX: 10,
};

export const GIFT = {
  PATH: {
    FACILITY: '/facility',
    WORK_PACKAGE: '/work-package',
    COUNTERPARTY: '/counterparty',
    CREATION_EVENT: '/creation-event',
  },
  VALIDATION: {
    FACILITY: {
      OVERVIEW: {
        CURRENCY: { MIN: 3, MAX: 3 },
        DEAL_ID: UKEFID.VALIDATION,
        EFFECTIVE_DATE: DATE_STRING_VALIDATION,
        END_OF_COVER_DATE: DATE_STRING_VALIDATION,
        EXPIRY_DATE: DATE_STRING_VALIDATION,
        FACILITY_AMOUNT: { MIN: 1 },
        FACILITY_ID: UKEFID.VALIDATION,
        FACILITY_NAME: { MIN: 1, MAX: 35 },
        PRODUCT_TYPE: { MIN: 3, MAX: 30 },
      },
      COUNTERPARTY: {
        COUNTERPARTY_URN: { MIN: 8, MAX: 8 },
        EXIT_DATE: DATE_STRING_VALIDATION,
        ROLE_ID: { MIN: 1 },
        SHARE_PERCENTAGE: { MIN: 1, MAX: 100 },
        START_DATE: DATE_STRING_VALIDATION,
      },
    },
  },
};

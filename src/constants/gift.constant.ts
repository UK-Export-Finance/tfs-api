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
  },
  VALIDATION: {
    CURRENCY: { MIN: 3, MAX: 3 },
    DEAL_ID: UKEFID.VALIDATION,
    EFFECTIVE_DATE: DATE_STRING_VALIDATION,
    END_OF_COVER_DATE: DATE_STRING_VALIDATION,
    EXPIRY_DATE: DATE_STRING_VALIDATION,
    FACILITY_AMOUNT: { MIN: 1 },
    FACILITY_ID: UKEFID.VALIDATION,
    FACILITY_NAME: { MIN: 1, MAX: 35 },
    OBLIGOR_URN: { MIN: 8, MAX: 8 },
    PRODUCT_TYPE: { MIN: 3, MAX: 30 },
  },
};

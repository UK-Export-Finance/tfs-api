import { REGEX } from './regex/index';

export const UKEFID = {
  // Prefix is used for 10 digit id (Deal, Facility) and 8 digit id (Party/Customer)
  MAIN_ID: {
    PREFIX: {
      DEV: '0030',
      QA: '0040',
      PROD: '0020',
    },
    TEN_DIGIT_REGEX: REGEX.UKEF_MAIN_ID_TEN_DIGIT,
    MULTIPLE_TEN_DIGIT_REGEX: REGEX.UKEF_MAIN_ID_MULTIPLE_TEN_DIGIT,
  },
  // Prefix is used for 10 digit Covenant record id
  COVENANT_ID: {
    PREFIX: '0000',
    REGEX: REGEX.UKEF_COVENANT_ID,
  },
  BUNDLE_ID: {
    PREFIX: '0000',
    REGEX: REGEX.UKEF_BUNDLE_ID,
  },
  PARTY_ID: {
    REGEX: REGEX.UKEF_PARTY_ID,
  },
  VALIDATION: { MIN_LENGTH: 10, MAX_LENGTH: 10 },
};

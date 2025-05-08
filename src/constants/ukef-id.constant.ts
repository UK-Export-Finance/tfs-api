export const UKEFID = {
  // Prefix is used for 10 digit id (Deal, Facility) and 8 digit id (Party/Customer)
  MAIN_ID: {
    PREFIX: {
      DEV: '0030',
      QA: '0040',
      PROD: '0020',
    },
    TEN_DIGIT_REGEX: /^00\d{8}$/,
  },
  // Prefix is used for 10 digit Covenant record id
  COVENANT_ID: {
    PREFIX: '0000',
    REGEX: /^0{4}\d{6}$/,
  },
  BUNDLE_ID: {
    PREFIX: '0000',
    REGEX: /^0{4}\d{6}$/,
  },
  PARTY_ID: {
    REGEX: /^\d{8}$/,
  },
  VALIDATION: { MIN_LENGTH: 10, MAX_LENGTH: 10 },
};

export const UKEFID = {
  // Prefix is used for 10 digit id (Deal, Facility) and 8 digit id (Party/Customer)
  MAIN_ID_PREFIX: {
    DEV: '0030',
    QA: '0040',
    PROD: '0020',
  },
  // Prefix is used for 10 digit Covenant record id
  COVENANT_ID_PREFIX: '0000',
  TEN_DIGIT_REGEX: /^00\d{8}$/,
};
